import {podcastCategoriesModel,podcastmodel} from '../../../models/podcastModel.js';


// Controller to add a new podcast
const newpodcast = async (req, res) => {
    try {
        const { userId, posterUrl, category, title, description } = req.body;

        // Create a new podcast instance
        const newPodcast = new Podcast({
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
        const existingPodcast = await Podcast.findById(podcastId);

        if (!existingPodcast) {
            return res.status(404).json({ message: 'Podcast not found' });
        }

        const newEpisode = {
            title,
            description,
            audioUrl,
            bgUrl,
        };

        // Add the new episode to the episodes array of the existing podcast
        existingPodcast.episodes.push(newEpisode);

        // Save the updated podcast to the database
        await existingPodcast.save();

        res.status(200).json({
            status: 'success',
            message: 'Episode added to the podcast'
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

    // Check if the podcast exists
    const existingPodcast = await Podcast.findById(podcastId);

    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    // Delete the podcast
    await existingPodcast.remove();

    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting podcast' });
  }
};

// Controller to delete an episode from a podcast by ID
const deleteEpisode = async (req, res) => {
  try {
    const { podcastId, episodeId } = req.params;

    // Check if the podcast exists
    const existingPodcast = await Podcast.findById(podcastId);

    if (!existingPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    // Remove the episode from the episodes array
    existingPodcast.episodes = existingPodcast.episodes.filter(
      (episode) => episode._id.toString() !== episodeId
    );

    // Save the updated podcast without the deleted episode
    await existingPodcast.save();

    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting episode' });
  }
};

// Controller to update a podcast by ID
const updatePodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const { title, description } = req.body;

    // Check if the podcast exists
    const existingPodcast = await Podcast.findById(podcastId);

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



export {
    newEpisode,
    newpodcast,
    deletePodcast,
    updatePodcast,
    updateEpisode,
    deleteEpisode
};
