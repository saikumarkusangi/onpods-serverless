import { quoteCategoryModel } from "../../../models/quoteModel.js"




// add new quote category
const addQuoteCategory = async(req,res)=>{
    try {
        const data = new quoteCategoryModel({
            ...req.body
        });
       const check = await quoteCategoryModel.findOne({name:req.body.name});
       if(check){
        return res.status(404).json({
            status:'fail',
            message:'Category Already Exists'
        });
       }
       await data.save();
       return res.status(200).json({
        status:'success',
        message:'Added Successfully'
       });
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
           });
    }
}


// fetch all categories
const allQuotesCategories = async(req,res)=>{
    try {
        const data = await quoteCategoryModel.find();
        return res.status(200).send(data);
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
        });
    }
}

// delete an category
const deleteQuoteCategory = async(req,res)=>{
    try {
        const {categoryId} = req.params;
        const result = await quoteCategoryModel.findByIdAndDelete(categoryId);
        if(result){
            return res.status(200).json({
                status:'success',
                message:'Category Deleted Sucessfully'
            });
        }
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
        });
    }
}

// update quote category
const updateQuoteCategory = async(req,res)=>{
    try {
        const {categoryId} = req.params;
        const newData = {...req.body}
        const result = await quoteCategoryModel.findByIdAndUpdate(
            categoryId,
            newData,
            {new:true}
        );
        if(result){
            return res.status(200).json({
                status:'success',
                message:'Category Updated Successfully',
                data:result
             });
        }
        return res.status(404).json({
            status:'fail',
            message:'Category not found'
         });
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
         });
    }
}

export {
    addQuoteCategory,
    allQuotesCategories,
    deleteQuoteCategory,
    updateQuoteCategory
}