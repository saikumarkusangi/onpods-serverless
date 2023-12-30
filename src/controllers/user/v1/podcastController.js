import { podcastCategoriesModel, podcastmodel } from '../../../models/podcastModel.js';
import usermodel from '../../../models/userModel.js';
import { deleteEpisodeFromS3 } from '../../../services/s3Service.js';

const podcastById = async (req, res) => {
    const { podcastId } = req.params;
    const userId = req.headers.authorization;

    try {
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

        const following = !!userFollowing;
        const averageRating = data.totalRating / data.numberOfRatings;
        const rating = parseFloat(averageRating.toFixed(1));
        const totalListens = data.episodes.reduce((sum, episode) => {
            const listens = episode.listens || 0;
            return sum + listens;
        }, 0);

        const user = await usermodel.findById(data.userId).select('username profilePic').lean().exec();

        // Shorten the followers count and total listens count
        const followersCountShortened = data.followers.length > 1000
            ? data.followers.length > 1000000
                ? `${(data.followers.length / 1000000).toFixed(1)}M`
                : `${(data.followers.length / 1000).toFixed(1)}K`
            : `${data.followers.length}`;

        const numberOfRatingShortened = data.numberOfRatings > 1000
            ? data.numberOfRatings > 1000000
                ? `${(data.numberOfRatings / 1000000).toFixed(1)}M`
                : `${(data.numberOfRatings / 1000).toFixed(1)}K`
            : `${data.numberOfRatings}`;

        const totalListensShortened = totalListens > 1000
            ? totalListens > 1000000
                ? `${(totalListens / 1000000).toFixed(1)}M`
                : `${(totalListens / 1000).toFixed(1)}K`
            : `${totalListens}`;

        const response = {
            user: user,
            categoryId: data.category,
            createdAt: data.createdAt,
            followers: followersCountShortened ?? '0',
            following: following,
            rating:rating ,
            rated: numberOfRatingShortened,
            certificate: data.certificate,
            totalListens: totalListensShortened ?? '0',
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


const topPodcasts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Calculate the number of documents to skip
        const skip = (pageNumber - 1) * limitNumber;

        // Find the top trending podcasts with pagination
        const data = await podcastmodel.aggregate([
            {
                $project: {
                    posterUrl: 1,
                    title: 1,
                    description: 1,
                    averageRating: { $avg: '$ratings.rating' }
                }
            },
            {
                $match: { averageRating: { $gt: 0 } }
            },
            {
                $sort: { averageRating: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limitNumber
            }
        ]);

        const totalCount = await podcastmodel.countDocuments();

        if (data.length > 0) {
            const filteredData = data.filter(podcast => !isNaN(podcast.averageRating));

            const totalPages = Math.ceil(filteredData.length / limitNumber);

            const response = filteredData.map(podcast => ({
                _id: podcast._id,
                userId: podcast.userId,
                title: podcast.title,
                description: podcast.description,
                posterUrl: podcast.posterUrl,
                averageRating: podcast.averageRating
            }));

            res.status(200).json({
                count: response.length,
                data: response,
                totalPages,
                page: pageNumber
            });
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'No trending podcasts found'
            });
        }
    } catch (error) {
        console.error('Error fetching trending podcasts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
};



// Get Podcasts by userId
const podcastsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {

        const data = await podcastmodel.find({ userId: userId });

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Podcasts not found',
            });
        }


        const response = data.map((podcast) => ({
            podcastId: podcast._id,
            posterUrl: podcast.posterUrl,
            title: podcast.title,
            description: podcast.description,
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};




// Controller to get podcast by category
const podcastByCategory = async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const matchPipeline = [{
            $match: {
                category: category,
            },
        },];

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
        let posterUrl = '';
        if (req.file && req.file.location) {
            posterUrl = req.file.location;
        }

        const { userId, category, title, description ,certificate} = req.body;

        // Create a new podcast instance
        const newPodcast = new podcastmodel({
            userId,
            posterUrl,
            category,
            title,
            description,
            certificate
        });

        // Save the new podcast to the database
        await newPodcast.save();

        res.status(200).json({
            status: 'success',
            podcastId: newPodcast._id,
            posterUrl: newPodcast.posterUrl
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
            podcastId, {
            $push: { episodes: newEpisode },
        }, { new: true }
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
            podcastId, {
            $pull: { episodes: { _id: episodeId } },
        }, { new: true }
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
        const { title, description, category,certificate } = req.body;

        // Check if the podcast exists
        const existingPodcast = await podcastmodel.findByIdAndUpdate(
            podcastId, { title, description, category }, { new: true }
        );

        if (!existingPodcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }

        if (req.file && req.file.location) {
            existingPodcast.posterUrl = req.file.location;
            await existingPodcast.save();
        }

        res.json({ message: 'Podcast updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error updating podcast: ${error.message}` });
    }
};


// Controller to update an episode by ID
const updateEpisode = async (req, res) => {
    try {
        const { podcastId, episodeId } = req.params;
        const { title, description } = req.body;

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

        if (req.file && req.file.posterUrl) {
            episodeToUpdate.posterUrl = req.file.location;
        }
        // Update episode properties
        episodeToUpdate.title = title || episodeToUpdate.title;
        episodeToUpdate.description = description || episodeToUpdate.description;



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
        const {
            query,
            user_page = 1,
            user_limit = 10,
            podcasts_page = 1,
            podcasts_limit = 10,
            episodes_page = 1,
            episodes_limit = 10,
        } = req.query;

        // Function to paginate an array
        const paginate = (array, page, limit) => {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            return array.slice(startIndex, endIndex);
        };

        // Search for podcasts, episodes, and users based on the query
        const [podcasts, episodes, users] = await Promise.all([
            podcastmodel
                .find({
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                    ],
                })
                .select('_id posterUrl title description')
                .limit(podcasts_limit)
                .skip((podcasts_page - 1) * podcasts_limit),
            podcastmodel
                .find({
                    episodes: {
                        $elemMatch: {
                            $or: [
                                { title: { $regex: query, $options: 'i' } },
                                { description: { $regex: query, $options: 'i' } },
                            ],
                        },
                    },
                })
                .select('posterUrl episodes title')
                .limit(podcasts_limit)
                .skip((podcasts_page - 1) * podcasts_limit),
            usermodel
                .find({ username: { $regex: query, $options: 'i' } })
                .select('username _id')
                .limit(user_limit)
                .skip((user_page - 1) * user_limit), // Case-insensitive username search
        ]);

        // Extract clean episodes data
        const cleanedEpisodes = episodes.map((podcast) => {
            return {
                ...podcast.toObject(), // Convert Mongoose document to a plain object
                episodes: paginate(
                    podcast.episodes.filter(
                        (episode) =>
                            episode.title.toLowerCase().includes(query.toLowerCase()) ||
                            episode.description.toLowerCase().includes(query.toLowerCase())
                    ),
                    episodes_page,
                    episodes_limit
                ), // Apply slice to limit the number of episodes
            };
        });

        res.status(200).json({
            podcasts: paginate(podcasts, podcasts_page, podcasts_limit),
            episodes: cleanedEpisodes,
            users: paginate(users, user_page, user_limit),
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

// controller to rate podcast
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

        podcast.totalRating = finalrating

        // Save the updated podcast document
        await podcast.save();

        res.status(200).json({ status: 'success', message: 'Podcast rated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};



// controller to listened increment podcast
const listenEpisode = async (req, res) => {
    const { podcastId, episodeId } = req.params;

    try {
        // Find the podcast by ID and the specific episode within it
        const podcast = await podcastmodel.findById(podcastId);

        if (!podcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }

        const episode = podcast.episodes.id(episodeId);

        if (!episode) {
            return res.status(404).json({ message: 'Episode not found' });
        }

        // Increment the listens count for the episode
        episode.listens += 1;

        // Save the changes to the parent podcast document
        await podcast.save();

        res.json({ message: 'Listen count updated successfully', listens: episode.listens });
    } catch (error) {
        console.error('Error updating listen count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// trending podcasts
const trendingPodcasts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Validate page and limit values

        const skip = (pageNumber - 1) * limitNumber;

        const data = await podcastmodel.aggregate([
            {
                $project: {
                    posterUrl: 1,
                    title: 1,
                    description: 1,
                    totalListens: { $sum: '$episodes.listens' },
                },
            },
            {
                $match: { totalListens: { $gt: 1 } },
            },
            {
                $sort: { totalListens: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limitNumber,
            },
        ]);

        const totalCount = await podcastmodel.countDocuments();

        if (data.length > 0) {
            const totalPages = Math.ceil(totalCount / limitNumber);

            const response = data.map((podcast) => ({
                _id: podcast._id,
                userId: podcast.userId,
                title: podcast.title,
                description: podcast.description,
                posterUrl: podcast.posterUrl,
            }));

            res.status(200).json({
                count: response.length,
                data: response,
                totalPages,
                page: pageNumber,
            });
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'No trending podcasts found',
            });
        }
    } catch (error) {
        console.error('Error fetching trending podcasts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
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
    ratePodcast,
    podcastsByUserId,
    listenEpisode,
    trendingPodcasts,
    topPodcasts
};