import { podcastBgCategoriesModel, podcastCategoriesModel, podcastmodel } from '../../../models/podcastModel.js';
import { deleteImageFromS3 } from '../../../services/s3Service.js';


const getById = async (req, res) => {
    const { categoryId } = req.params;
    try {
      const category = await podcastBgCategoriesModel.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(404).json({
        status:'fail',
        message:`${error}`
       });
    }
  };

  const getAudioById = async (req, res) => {
    const { audioId } = req.params;

    try {
      const audioEntry = await podcastBgCategoriesModel
        .findOne(
          {
            'data._id': audioId,
          },
          {
            'data.$': 1,
            _id: 0,
          }
        )
        .lean();

      if (!audioEntry) {
        return res.status(404).json({ error: 'Audio entry not found' });
      }

      res.status(200).json({ audioUrl: audioEntry.data[0].audioUrl });
    } catch (error) {
      res.status(404).json({
        status: 'fail',
        message: `${error}`,
      });
    }
  };




const addDataToCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { name, audioUrl } = req.body;

    try {
      const category = await podcastBgCategoriesModel.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      category.data.push({ name, audioUrl });
      await category.save();

      res.status(200).json(category);
    } catch (error) {
      res.status(404).json({
        status:'fail',
        message:`${error}`
       });
    }
  };


const getAll = async (req, res) => {
    try {
      const categories = await podcastBgCategoriesModel.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(404).json({
        status:'fail',
        message:`${error}`
      });
    }
  };


const create = async (req, res) => {
    try {
      const category = new podcastBgCategoriesModel(req.body);
      await category.save();
      res.status(200).json(category);
    } catch (error) {
      res.status(404).json({
        status:'fail',
        message:`${error}`
      });
    }
  };

const deleteAudioById = async (req, res) => {
    const { categoryId, audioId } = req.params;

    try {
        const category = await podcastBgCategoriesModel.findByIdAndUpdate(
          categoryId,
          {
            $pull: { data: { _id: audioId } },
          },
          { new: true }
        );

        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
          status: 'success',
          message: 'Audio deleted successfully',
        });
      } catch (error) {
        res.status(404).json({ message: `${error}` });
      }
    };

const updateCategoryById = async(req,res)=>{
    const {categoryId} = req.params;
    try {
        const {category} = req.body;
        const updateCategory = await podcastBgCategoriesModel.findByIdAndUpdate(
            categoryId,
            {category},
            {new:true}
        );
        return res.status(200).json({
            message:'Category Updated successfully',

        })
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
        })
    }
}

const deleteById = async (req, res) => {
    const { categoryId } = req.params;
    try {
      const deletedCategory = await podcastBgCategoriesModel.findByIdAndRemove(categoryId);
      if (!deletedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json({
        status:'success',
        message:'Deleted Successfully'
      });
    } catch (error) {
      res.status(404).json({
        status:'fail',
        message:`${error}`
      });
    }
  };

// Add New Podcast Category

const addPodcastCategory = async (req, res) => {
    try {
        const imageUrl = req.file.location;
        const { name, color } = req.body;
        const data = new podcastCategoriesModel({
            name,
            color,
            imageUrl
        });
        const check = await podcastCategoriesModel.findOne({ name: req.body.name });
        if (check) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category Already Exists'
            });
        }
        await data.save();
        return res.status(200).json({
            status: 'success',
            message: 'Added Successfully'
        });
    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: `${error}`
        });
    }
}



// fetch all podcast categories
const fetchPodcastCategories = async (req, res) => {
    try {
        const categories = await podcastCategoriesModel.find();
        const responseData = [];

        for (const category of categories) {
            const data = await podcastmodel.findOne({ category: category._id });

            const categoryWithFlag = {
                ...category.toObject(),
                data: !!data, // Set data to true if there is corresponding data, false otherwise
            };

            responseData.push(categoryWithFlag);
        }

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: `${error}`,
        });
    }
};




// delete an podcast category
const deletePodcastCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await podcastCategoriesModel.findByIdAndDelete(categoryId);
        if (result) {
            return res.status(200).json({
                status: 'success',
                message: 'Category Deleted Sucessfully'
            });
        }
    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: `${error}`
        });
    }
}

// update podcast category
const updatePodcastCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const imageUrl = req.file ? req.file.location : undefined;

        // If a file is present, delete the existing image from S3
        if (req.file) {
            const category = await podcastCategoriesModel.findById(categoryId);

            // Log category to see if it's retrieved correctly
            console.log('Category:', category);

            // Check if category and imageUrl exist before splitting
            if (category && category.imageUrl) {
                const parts = category.imageUrl.split('/');
                const objectKey = parts[parts.length - 1];
                await deleteImageFromS3(objectKey);
            }
        }

        // Create an object with the updated data
        const newData = {
            ...(req.file && { imageUrl }),
            ...req.body,
        };

        // Use findByIdAndUpdate to update the category with the new data
        const result = await podcastCategoriesModel.findByIdAndUpdate(
            categoryId,
            newData
        );

        if (result) {
            return res.status(200).json({
                status: 'success',
                message: 'Category Updated Successfully',

            });
        }

        return res.status(404).json({
            status: 'fail',
            message: 'Category not found',
        });
    } catch (error) {
        console.error('Error:', error);

        return res.status(500).json({
            status: 'error',
            message: `${error}`,
        });
    }
};






export {
    getAll,
    create,
    deleteById,
    deleteAudioById,
    updateCategoryById,
    addPodcastCategory,
    updatePodcastCategory,
    deletePodcastCategory,
    fetchPodcastCategories,
    getById,
    getAudioById,
    addDataToCategory

}