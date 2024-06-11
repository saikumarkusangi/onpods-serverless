import mongoose from 'mongoose';
import { podcastCategoriesModel, podcastmodel } from '../../../models/podcastModel.js';
import userModel from '../../../models/userModel.js';
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

        // Update totalRating with the actual rating
        const averageRating = data.numberOfRatings > 0
            ? (data.totalRating / data.numberOfRatings).toFixed(1)
            : 0;

        const totalListens = data.episodes.reduce((sum, episode) => {
            const listens = episode.listens || 0;
            return sum + listens;
        }, 0);

        const user = await usermodel.findById(data.userId).select('username profilePic').lean().exec();
        const currentUser = await usermodel.findById(userId).select('myList');
        const addedToMyList = currentUser.myList.indexOf(podcastId) !== -1;

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
            poster:data.posterUrl,
            categoryId: data.category,
            createdAt: data.createdAt,
            followers: followersCountShortened ?? '0',
            following: following,
            rating: parseFloat(averageRating),
            rated: numberOfRatingShortened,
            certificate: data.certificate,
            totalListens: totalListensShortened ?? '0',
            episodes: data.episodes,
            addedToMyList
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
   
    const { page = 1, limit = 10 ,sortBy} = req.query;
    // if sortBy is ratings sort by high rated else if listenCount sort higest totalListens else recentUpload sort by createdAt
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
                    description: 1,
                    totalListens: { $sum: '$episodes.listens' },
                    numberOfRatings:1,
                    totalRating:1
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ];

          // Sorting pipeline stage based on sortBy parameter
          if (sortBy === 'ratings') {
            dataPipeline.push({
                $addFields: {
                    averageRating: { $divide: ['$totalRating', '$numberOfRatings'] }, // Calculate averageRating
                },
            });
            dataPipeline.push({ $sort: { averageRating: -1 } }); // Sort by descending totalRating
        } else if (sortBy === 'listenCount') {
            dataPipeline.push({ $sort: { totalListens: -1 } }); // Sort by descending totalListens
        } else {
            dataPipeline.push({ $sort: { createdAt: -1 } }); // Default to sorting by createdAt in descending order
        }

        const countResult = await podcastmodel.aggregate(countPipeline);
        const data = await podcastmodel.aggregate(dataPipeline);

        const count = countResult.length > 0 ? countResult[0].count : 0;
        const totalPages = Math.ceil(count / limit);


        // Transforming data
        const transformedData = data.map(podcast => {
            const averageRating = podcast.numberOfRatings > 0
            ? (podcast.totalRating / podcast.numberOfRatings).toFixed(1)
            : 0;
            return ({
                _id: podcast._id,
                title: podcast.title,
                description: podcast.description,
                posterUrl: podcast.posterUrl,
                totalListens: formatShortenedNumber(podcast.totalListens),
                rating: formatShortenedNumber(averageRating),
            });
        });

        return res.status(200).json({
            count,
            data: transformedData,
            page: parseInt(page),
            totalPages,
        });
    } catch (error) {
        return res.status(505).json({
            status: 'fail',
            message: `${error}`,
        });
    }
};

// Helper function to format shortened numbers
const formatShortenedNumber = (value) => {
    return value > 1000
        ? value > 1000000
            ? `${(value / 1000000).toFixed(1)}M`
            : `${(value / 1000).toFixed(1)}K`
        : `${value}`;
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
            const slicedArray = array.slice(startIndex, endIndex);
            const total_pages = Math.ceil(array.length / limit);
            const current_page = page;

            return {
                items: slicedArray,
                total_pages,
                current_page,
            };
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
                .select('username _id profilePic')
                .limit(user_limit)
                .skip((user_page - 1) * user_limit), // Case-insensitive username search
        ]);

        // Extract clean episodes data
        const cleanedEpisodes = episodes.map((podcast) => {
            return {
                ...podcast.toObject(), // Convert Mongoose document to a plain object
                episodes:
                    podcast.episodes.filter(
                        (episode) =>
                            episode.title.toLowerCase().includes(query.toLowerCase()) ||
                            episode.description.toLowerCase().includes(query.toLowerCase())
                    ),

                 // Apply slice to limit the number of episodes
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
        podcast.numberOfRatings += 1;
        podcast.totalRating += parseFloat(rating);

        // Calculate the averageRating
        const averageRating = podcast.totalRating / podcast.numberOfRatings;

        // Save the updated podcast document
        await podcast.save();

        res.status(200).json({
            status: 'success',
            message: 'Podcast rated successfully',
            averageRating
        });
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


// based on user interest podcasts
const basedOnUserInterests = async (req, res) => {
    try {
        const userId = req.headers.authorization;
        const user = await userModel.findById(userId);

        let categoryPodcasts;

        if (user.interests && user.interests.length > 0) {
            // User has interests, fetch based on interests
            categoryPodcasts = await Promise.all(user.interests.map(async (categoryId) => {
                const podcasts = await podcastmodel.find({ category: categoryId })
                    .select('posterUrl title description')
                    .limit(1)
                    .exec();

                const currentUser = await usermodel.findById(userId).select('myList');

                // Check if each podcast is added to the user's myList
                const podcastsWithAddedToMyList = podcasts.map(podcast => {
                    const addedToMyList = currentUser.myList.includes(podcast._id);
                    return { ...podcast.toObject(), addedToMyList };
                });

                // Randomize the order of podcasts
                const randomizedPodcasts = podcastsWithAddedToMyList.sort(() => Math.random() - 0.5);

                return randomizedPodcasts;
            }));
        } else {
            // User has no interests, fetch random podcasts
            const randomPodcasts = await podcastmodel.aggregate([
                { $sample: { size: 3 } },
            ]);

            const currentUser = await usermodel.findById(userId).select('myList');

            // Check if the random podcast is added to the user's myList
            const podcastsWithAddedToMyList = randomPodcasts.map(podcast => {
                const addedToMyList = currentUser.myList.includes(podcast._id);
                return { ...podcast, addedToMyList };
            });

            categoryPodcasts = [podcastsWithAddedToMyList];
        }

        // Flatten the nested arrays
        const flattenedPodcasts = categoryPodcasts.flat();

        res.status(200).json({
            data: flattenedPodcasts
        });
    } catch (error) {
        console.error('Error fetching podcasts based on user interests:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};







export {
    basedOnUserInterests,
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