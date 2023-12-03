import { podcastCategoriesModel, podcastmodel } from '../../../models/podcastModel.js';
import usermodel from '../../../models/userModel.js';
import { deleteEpisodeFromS3 } from '../../../services/s3Service.js';

const podcastById = async (req, res) => {
  const { podcastId } = req.params;
  const userId = req.headers.authorization;

  try {
    // Retrieve podcast data and user following information in parallel
    const [data, userFollowing] = await Promise.all([
      podcastmodel.findById(podcastId).lean().exec(),
      podcastmodel.findOne({ _id: podcastId, followers: userId }).lean().exec(),
    ]);

    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Podcast not found'
      });
    }

    const following = !!userFollowing; // Convert to boolean
     // Calculate the average rating
     const averageRating = data.totalRating / data.numberOfRatings;
     // Round the averageRating to one decimal place
     const rating = parseFloat(averageRating.toFixed(1));

    const response = {
      _id: data._id,
      userId: data.userId,
      createdAt: data.createdAt,
      followers: data.followers.length,
      following: following,
      rating,
      rated:data.numberOfRatings,
      posterUrl: data.posterUrl,
      category: data.category,
      title: data.title,
      description: data.description,
      episodes: data.episodes,
      
    };

    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: `${error}`
    });
  }
};




// Controller to get podcast by category
const podcastByCategory = async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const matchPipeline = [
      {
        $match: {
          category: category,
        },
      },
    ];

    const countPipeline = [...matchPipeline, { $count: 'count' }];

    const dataPipeline = [
      ...matchPipeline,
      {
        $project: {
          _id: 1,
          posterUrl: 1,
          title: 1,
          description: 1

        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ];

    const countResult = await podcastmodel.aggregate(countPipeline);
    const data = await podcastmodel.aggregate(dataPipeline);

    const count = countResult.length > 0 ? countResult[0].count : 0;
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      count,
      data,
      page: parseInt(page),
      totalPages,

    });
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: `${error}`,
    });
  }
};

// Controller to add a new podcast
const newpodcast = async (req, res) => {
  try {
    const posterUrl = req.file.location;
    const { userId, category, title, description } = req.body;

    // Create a new podcast instance
    const newPodcast = new podcastmodel({
      userId,
      posterUrl,
      category,
      title,
      description,
    });

    // Save the new podcast to the database
    await newPodcast.save();

    res.status(200).json({
      status: 'success',
      message: 'Podcast created successfully'
    });
  } catch (error) {

    res.status(500).json({ message: 'Error creating podcast' });
  }
};

// Controller to add a new episode to an existing podcast
const newEpisode = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { podcastId } = req.params;

    // Check if the podcast exists
    const existingPodcast = await podcastmodel.findById(podcastId);
    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    const { audioUrl, posterUrl } = req.files;

    const newEpisode = {
      title,
      description,
      audioUrl: audioUrl ? audioUrl[0].location : undefined,
      posterUrl: posterUrl ? posterUrl[0].location : undefined,
    };

    // Push the new episode to the episodes array of the existing podcast
    const updatedPodcast = await podcastmodel.findByIdAndUpdate(
      podcastId,
      {
        $push: { episodes: newEpisode },
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Episode added to the podcast',
    });
  } catch (error) {

    res.status(500).json({ message: 'Error adding episode to the podcast' });
  }
};


// Controller to delete a podcast by ID
const deletePodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;

    const podcast = await podcastmodel
      .findById(podcastId)
      .select('episodes');

    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    // Delete every episode associated with the podcast
    await Promise.all(
      podcast.episodes.map(async (episode) => {
        await Promise.all([
          deleteEpisodeFromS3(episode.audioUrl),
          deleteEpisodeFromS3(episode.posterUrl),
        ]);
      })
    );

    // Delete the podcast itself
    await podcastmodel.findByIdAndDelete(podcastId);

    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {

    res.status(500).json({ message: 'Error deleting podcast' });
  }
};


// Controller to delete an episode from a podcast by ID
const deleteEpisode = async (req, res) => {
  const { podcastId, episodeId } = req.params;

  try {
    const podcast = await podcastmodel
      .findById(podcastId)
      .select('episodes');

    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    const selectedEpisode = podcast.episodes.find(episode => episode._id.toString() === episodeId);

    if (!selectedEpisode) {
      return res.status(404).json({
        status: 'fail',
        message: 'Episode not found'
      });
    }

    await Promise.all([
      deleteEpisodeFromS3(selectedEpisode.audioUrl),
      deleteEpisodeFromS3(selectedEpisode.posterUrl)
    ]);

    const category = await podcastmodel.findByIdAndUpdate(
      podcastId,
      {
        $pull: { episodes: { _id: episodeId } },
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Episode deleted successfully',
    });
  } catch (error) {

    res.status(500).json({ message: 'Error deleting episode' });
  }
};

// Controller to update a podcast by ID
const updatePodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const { title, description, category } = req.body;

    // Check if the podcast exists
    const existingPodcast = await podcastmodel.findByIdAndUpdate(
      podcastId,
      { ...req.body },

    );

    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    res.json({ message: 'Podcast updated successfully' });
  } catch (error) {

    res.status(500).json({ message: `Error updating podcast: ${error.message}` });
  }
};

// Controller to update an episode by ID
const updateEpisode = async (req, res) => {
  try {
    const { podcastId, episodeId } = req.params;
    const { title, description, posterUrl } = req.body;

    // Check if the podcast exists
    const existingPodcast = await podcastmodel.findById(podcastId);

    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    // Find the episode by ID and update its properties
    const episodeToUpdate = existingPodcast.episodes.id(episodeId);
    if (!episodeToUpdate) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Update episode properties
    episodeToUpdate.title = title || episodeToUpdate.title;
    episodeToUpdate.description = description || episodeToUpdate.description;
    episodeToUpdate.posterUrl = posterUrl || episodeToUpdate.posterUrl;


    // Save the updated podcast
    await existingPodcast.save();

    res.json({ message: 'Episode updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating episode' });
  }
};


// search
const search = async (req, res) => {
  try {
    const { query } = req.query;

    // Search for podcasts, episodes, and users based on the query
    const [podcasts, episodes, users] = await Promise.all([
      podcastmodel.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      }).select('_id posterUrl title description'),
      podcastmodel.find({
        episodes: {
          $elemMatch: {
            $or: [
              { title: { $regex: query, $options: 'i' } }, // Case-insensitive title search
              { description: { $regex: query, $options: 'i' } }, // Case-insensitive description search
            ],
          },
        },
      }).select('posterUrl episodes'),
      await usermodel.find({ username: { $regex: query, $options: 'i' } }).select('username _id'), // Case-insensitive username search
    ]);

    res.status(200).json({
      podcasts,
      episodes,
      users,
    });
  } catch (error) {
    res.status(404).json({ message: `${error}` });
  }
};



// Follow Podcast
const followPodcast = async (req, res, next) => {
  try {
    const userId = req.headers.authorization;
    const { podcastId } = req.params;

    // Check Podcast Followers List
    const podcast = await podcastmodel.findById(podcastId);

    // Check if the user is already following the podcast
    const followingIndex = podcast.followers.indexOf(userId);

    if (followingIndex === -1) {
      // Follow podcast
      podcast.followers.push(userId);
    } else {
      // Unfollow podcast
      podcast.followers.splice(followingIndex, 1);
    }

    // Save the updated podcast document
    await podcast.save();

    // Respond with success message based on follow/unfollow action
    const message = followingIndex === -1 ? 'Following Podcast' : 'Unfollowed Podcast';

    res.status(200).json({
      status: 'success',
      message: message
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
const ratePodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const { rating } = req.body;

    // Find the podcast by ID
    const podcast = await podcastmodel.findById(podcastId);

    if (!podcast) {
      return res.status(404).json({ status: 'fail', message: 'Podcast not found' });
    }

    // Update totalRating and numberOfRatings
    podcast.totalRating += rating;
    podcast.numberOfRatings += 1;

    // Calculate the average rating
    const averageRating = podcast.totalRating / podcast.numberOfRatings;
    // Round the averageRating to one decimal place
    const finalrating = parseFloat(averageRating.toFixed(1));


    // Save the updated podcast document
    await podcast.save();

    res.status(200).json({ status: 'success', message: 'Podcast rated successfully', rating:finalrating });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};






export {
  newEpisode,
  newpodcast,
  deletePodcast,
  updatePodcast,
  updateEpisode,
  deleteEpisode,
  podcastByCategory,
  podcastById,
  search,
  followPodcast,
  ratePodcast
};
