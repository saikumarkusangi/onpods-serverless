import {podcastBgCategoriesModel, podcastCategoriesModel} from '../../../models/podcastModel.js';

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
  
  

export {
    addDataToCategory,
    getById,
    getAll,
    create,
    deleteById,
    deleteAudioById,
    updateCategoryById,
    getAudioById
}