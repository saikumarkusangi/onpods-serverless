import {podcastCategoriesModel,podcastmodel} from '../../../models/podcastModel.js';
import usermodel from '../../../models/userModel.js';

// controller to get podcast by id
const podcastById = async(req,res)=>{
  const {podcastId} = req.params;
try {
  const data = await podcastmodel.findById(podcastId);
  return res.status(200).json(data)
} catch (error) {
  return res.status(404).json({
    status:"fail",
    message:`${error}`
  })
}
}


// Controller to get podcast by Id
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
        const { userId, posterUrl, category, title, description } = req.body;

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
        console.error(error);
        res.status(500).json({ message: 'Error creating podcast' });
    }
};

// Controller to add a new episode to an existing podcast
const newEpisode = async (req, res) => {
  try {
    const { title, description, audioUrl, bgUrl } = req.body;
    const { podcastId } = req.params;

    // Check if the podcast exists
    const existingPodcast = await podcastmodel.findById(podcastId);

    const newEpisode = {
      title,
      description,
      audioUrl,
      bgUrl,
    };

    // Push the new episode to the episodes array of the existing podcast
    await podcastmodel.findByIdAndUpdate(
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
    console.error(error);
    res.status(500).json({ message: 'Error adding episode to the podcast' });
  }
};


// Controller to delete a podcast by ID
const deletePodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;
    await podcastmodel.findByIdAndDelete(podcastId);
    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Error deleting podcast' });
  }
};

// Controller to delete an episode from a podcast by ID
const deleteEpisode = async (req, res) => {
  const { podcastId, episodeId } = req.params;

  try {
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
    res.status(404).json({ message: `${error}` });
  }
  
};

// Controller to update a podcast by ID
const updatePodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const { title, description } = req.body;

    // Check if the podcast exists
    const existingPodcast = await podcastmodel.findById(podcastId);

    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    // Update the podcast properties
    existingPodcast.title = title;
    existingPodcast.description = description;

    // Save the updated podcast
    await existingPodcast.save();

    res.json({ message: 'Podcast updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating podcast' });
  }
};

// Controller to update an episode by ID
const updateEpisode = async (req, res) => {
  try {
    const { podcastId, episodeId } = req.params;
    const { title, description, audioUrl, bgUrl } = req.body;

    // Check if the podcast exists
    const existingPodcast = await Podcast.findById(podcastId);

    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    // Find the episode by ID and update its properties
    const episodeToUpdate = existingPodcast.episodes.id(episodeId);
    if (!episodeToUpdate) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    episodeToUpdate.title = title;
    episodeToUpdate.description = description;
    episodeToUpdate.audioUrl = audioUrl;
    episodeToUpdate.bgUrl = bgUrl;

    // Save the updated podcast with the modified episode
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
    res.status(404).json({ message:  `${error}` });
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
    search
};
