// import React, { useState } from 'react'
// import {assets} from '../assets/assets'
// import axios from 'axios'
// import { backendUrl } from '../App'
// import { toast } from 'react-toastify'

// const Add = ({token}) => {

//   const [image1,setImage1] = useState(false)
//   const [image2,setImage2] = useState(false)
//   const [image3,setImage3] = useState(false)
//   const [image4,setImage4] = useState(false)

//    const [name, setName] = useState("");
//    const [description, setDescription] = useState("");
//    const [price, setPrice] = useState("");
//    const [gender, setGender] = useState("");
//    const [category, setCategory] = useState("");
//    const [subCategory, setSubCategory] = useState("");
//    const [occasion, setOccasion] = useState([]);
//    const [type, setType] = useState([]);
//    const [filterTags, setFilterTags] = useState([]);
//    const [bestseller, setBestseller] = useState(false);
//    const [sizes, setSizes] = useState([]);
//    const [stock, setStock] = useState({});
//    const [hasSize, setHasSize] = useState(true);
//    const [customFilters, setCustomFilters] = useState("");

//    const onSubmitHandler = async (e) => {
//     e.preventDefault();

//     if (!gender) {
//       toast.error("Please select a gender");
//       return;
//     }

//     try {
      
//       const formData = new FormData()

//       formData.append("name",name)
//       formData.append("description",description)
//       formData.append("price",price)
//       formData.append("gender", gender)
//       formData.append("category",category)
//       formData.append("subCategory",subCategory)
//       formData.append("bestseller",bestseller)
//       formData.append("hasSize", hasSize)
//       formData.append("sizes", JSON.stringify(hasSize ? sizes : []))
//       formData.append("filters", customFilters)  // Add custom filters JSON string
//       // Normalize stock for no-size products to object with value key for consistency with backend parsing
//       if (hasSize) {
//         formData.append("stock", JSON.stringify(stock));
//       } else {
//         formData.append("stock", JSON.stringify({ value: stock.value || 0 }));
//       }

//       image1 && formData.append("image1",image1)
//       image2 && formData.append("image2",image2)
//       image3 && formData.append("image3",image3)
//       image4 && formData.append("image4",image4)

//       const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

//       if (response.data.success) {
//         toast.success(response.data.message)
//         setName('')
//         setDescription('')
//         setImage1(false)
//         setImage2(false)
//         setImage3(false)
//         setImage4(false)
//         setPrice('')
//         setSizes([])
//         setStock({})
//         setHasSize(true)
//         setCustomFilters("")
//         setGender("")
//         setCategory("")
//         setSubCategory("")
//         setOccasion([])
//         setType([])
//         setFilterTags([])
//         setBestseller(false)
//       } else {
//         toast.error(response.data.message)
//       }

//     } catch (error) {
//       console.log(error);
//       toast.error(error.message)
//     }
//    }

//   return (
//     <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
//         <div>
//           <p className='mb-2'>Upload Image</p>

//           <div className='flex gap-2'>
//             <label htmlFor="image1">
//               <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
//               <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
//             </label>
//             <label htmlFor="image2">
//               <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
//               <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
//             </label>
//             <label htmlFor="image3">
//               <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
//               <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
//             </label>
//             <label htmlFor="image4">
//               <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
//               <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
//             </label>
//           </div>
//         </div>

//         <div className='w-full'>
//           <p className='mb-2'>Product name</p>
//           <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
//         </div>

//         <div className='w-full'>
//           <p className='mb-2'>Product description</p>
//           <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required/>
//         </div>

//         <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

//             <div>
//               <p className='mb-2'>Gender</p>
//               <select
//                 value={gender}
//                 onChange={(e) => setGender(e.target.value)}
//                 className="w-full px-3 py-2 border"
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Women">Women</option>
//                 <option value="Men">Men</option>
//                 <option value="Children">Children</option>
//               </select>
//             </div>

//             <div>
//               <p className='mb-2'>Product category</p>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="w-full px-3 py-2 border"
//               >
//                 <option value="">Select Category</option>
//                 {gender === "Women" && (
//                   <>
//                     <option value="Saree">Saree</option>
//                     <option value="Kurti">Kurti</option>
//                   </>
//                 )}
//                 {gender === "Men" && (
//                   <>
//                     <option value="Shirt">Shirt</option>
//                     <option value="Pants">Pants</option>
//                   </>
//                 )}
//                 {gender === "Children" && (
//                   <>
//                     <option value="Suit">Suit</option>
//                   </>
//                 )}
//               </select>
//             </div>

//             <div>
//               <p className='mb-2'>Sub category</p>
//               <input
//                 type="text"
//                 value={subCategory}
//                 onChange={(e) => setSubCategory(e.target.value)}
//                 placeholder="Enter subcategory"
//                 className="w-full px-3 py-2 border"
//               />
//             </div>

//             <div>
//               <p className='mb-2'>Product Price</p>
//               <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
//             </div>

//         </div>

//         <div>
//           <p className='mb-2'>Has Size?</p>
//           <input
//             type="checkbox"
//             checked={hasSize}
//             onChange={() => {
//               setHasSize(prev => !prev);
//               setSizes([]);
//               setStock({});
//             }}
//           />
//         </div>

//         {hasSize ? (
//           <>
//             <div>
//               <p className='mb-2'>Product Sizes</p>
//               <div className='flex gap-3'>
//                 <div onClick={()=>setSizes(prev => prev.includes("S") ? prev.filter( item => item !== "S") : [...prev,"S"])}>
//                   <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>S</p>
//                 </div>
                
//                 <div onClick={()=>setSizes(prev => prev.includes("M") ? prev.filter( item => item !== "M") : [...prev,"M"])}>
//                   <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>M</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("L") ? prev.filter( item => item !== "L") : [...prev,"L"])}>
//                   <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>L</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("XL") ? prev.filter( item => item !== "XL") : [...prev,"XL"])}>
//                   <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XL</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("XXL") ? prev.filter( item => item !== "XXL") : [...prev,"XXL"])}>
//                   <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("3XL") ? prev.filter( item => item !== "3XL") : [...prev,"3XL"])}>
//                   <p className={`${sizes.includes("3XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>3XL</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("4XL") ? prev.filter( item => item !== "4XL") : [...prev,"4XL"])}>
//                   <p className={`${sizes.includes("4XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>4XL</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("5XL") ? prev.filter( item => item !== "5XL") : [...prev,"5XL"])}>
//                   <p className={`${sizes.includes("5XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>5XL</p>
//                 </div>

//                 <div onClick={()=>setSizes(prev => prev.includes("6XL") ? prev.filter( item => item !== "6XL") : [...prev,"6XL"])}>
//                   <p className={`${sizes.includes("6XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>6XL</p>
//                 </div>
//                 <div onClick={()=>setSizes(prev => prev.includes("7XL") ? prev.filter( item => item !== "7XL") : [...prev,"7XL"])}>
//                   <p className={`${sizes.includes("7XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>7XL</p>
//                 </div>
//               </div>
//             </div>
         
//             <div className='mt-4'>
//               <p className='mb-2'>Stock per Size</p>
//               <div className='grid grid-cols-3 gap-2'>
//                 {sizes.map(size => (
//                   <div key={size} className='flex items-center'>
//                     <span className='mr-2 w-8'>{size}:</span>
//                     <input
//                       type="number"
//                       min="0"
//                       value={stock[size] || 0}
//                       onChange={(e) => setStock({...stock, [size]: parseInt(e.target.value)})}
//                       className='w-full px-2 py-1 border'
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className='mt-4'>
//             <p className='mb-2'>Stock</p>
//             <input
//               type="number"
//               min="0"
//               value={stock.value || 0}
//               onChange={(e) => setStock({ value: parseInt(e.target.value) })}
//               className='w-full max-w-[120px] px-2 py-1 border'
//             />
//           </div>
//         )}


//         <div className='flex gap-2 mt-2'>
//           <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
//           <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
//         </div>

//         <div className="mt-4 w-full max-w-[500px]">
//           <p className="mb-2">Occasion</p>
//           <div className="flex gap-4">
//             {['Designer', 'Casual', 'Formal'].map((item) => (
//               <label key={item} className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={occasion.includes(item)}
//                   onChange={() => {
//                     if (occasion.includes(item)) {
//                       setOccasion(occasion.filter(i => i !== item));
//                     } else {
//                       setOccasion([...occasion, item]);
//                     }
//                   }}
//                 />
//                 {item}
//               </label>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4 w-full max-w-[500px]">
//           <p className="mb-2">Type</p>
//           <div className="flex gap-4">
//             {['Printed', 'Embroidered', 'Plain'].map((item) => (
//               <label key={item} className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={type.includes(item)}
//                   onChange={() => {
//                     if (type.includes(item)) {
//                       setType(type.filter(i => i !== item));
//                     } else {
//                       setType([...type, item]);
//                     }
//                   }}
//                 />
//                 {item}
//               </label>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4 w-full max-w-[500px]">
//           <p className="mb-2">Dynamic Filter Tags (comma separated)</p>
//           <input
//             type="text"
//             value={filterTags.join(', ')}
//             onChange={(e) => setFilterTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
//             placeholder="e.g. Cotton, Red, Long Sleeves"
//             className="w-full px-3 py-2 border"
//           />
//         </div>

//         <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>

//     </form>
//   )
// }

// export default Add



import React, { useState } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [price, setPrice] = useState("");
   const [gender, setGender] = useState("");
   const [category, setCategory] = useState("");
   const [subCategory, setSubCategory] = useState("");
   const [occasion, setOccasion] = useState([]);
   const [type, setType] = useState([]);
   const [filterTags, setFilterTags] = useState([]);
   const [bestseller, setBestseller] = useState(false);
   const [sizes, setSizes] = useState([]);
   const [stock, setStock] = useState({});
   const [hasSize, setHasSize] = useState(true);

   const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!gender) {
      toast.error("Please select a gender");
      return;
    }

    try {
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("gender", gender)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("hasSize", hasSize)
      formData.append("sizes", JSON.stringify(hasSize ? sizes : []))
      formData.append("occasion", JSON.stringify(occasion))
      formData.append("type", JSON.stringify(type))
      formData.append("filterTags", JSON.stringify(filterTags))
      
      // Handle stock properly
      if (hasSize) {
        formData.append("stock", JSON.stringify(stock));
      } else {
        formData.append("stock", JSON.stringify({ value: stock.value || 0 }));
      }

      image1 && formData.append("image1",image1)
      image2 && formData.append("image2",image2)
      image3 && formData.append("image3",image3)
      image4 && formData.append("image4",image4)

      const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
        setSizes([])
        setStock({})
        setHasSize(true)
        setGender("")
        setCategory("")
        setSubCategory("")
        setOccasion([])
        setType([])
        setFilterTags([])
        setBestseller(false)
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
   }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Upload Image</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product description</p>
          <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required/>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

            <div>
              <p className='mb-2'>Gender</p>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border"
              >
                <option value="">Select Gender</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Children">Children</option>
              </select>
            </div>

            <div>
              <p className='mb-2'>Product category</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border"
              >
                <option value="">Select Category</option>
                {gender === "Women" && (
                  <>
                    <option value="Saree">Saree</option>
                    <option value="Kurti">Kurti</option>
                  </>
                )}
                {gender === "Men" && (
                  <>
                    <option value="Shirt">Shirt</option>
                    <option value="Pants">Pants</option>
                  </>
                )}
                {gender === "Children" && (
                  <>
                    <option value="Suit">Suit</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <p className='mb-2'>Sub category</p>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Enter subcategory"
                className="w-full px-3 py-2 border"
              />
            </div>

            <div>
              <p className='mb-2'>Product Price</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
            </div>

        </div>

        <div>
          <p className='mb-2'>Has Size?</p>
          <input
            type="checkbox"
            checked={hasSize}
            onChange={() => {
              setHasSize(prev => !prev);
              setSizes([]);
              setStock({});
            }}
          />
        </div>

        {hasSize ? (
          <>
            <div>
              <p className='mb-2'>Product Sizes</p>
              <div className='flex gap-3'>
                <div onClick={()=>setSizes(prev => prev.includes("S") ? prev.filter( item => item !== "S") : [...prev,"S"])}>
                  <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>S</p>
                </div>
                
                <div onClick={()=>setSizes(prev => prev.includes("M") ? prev.filter( item => item !== "M") : [...prev,"M"])}>
                  <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>M</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("L") ? prev.filter( item => item !== "L") : [...prev,"L"])}>
                  <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>L</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("XL") ? prev.filter( item => item !== "XL") : [...prev,"XL"])}>
                  <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XL</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("XXL") ? prev.filter( item => item !== "XXL") : [...prev,"XXL"])}>
                  <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("3XL") ? prev.filter( item => item !== "3XL") : [...prev,"3XL"])}>
                  <p className={`${sizes.includes("3XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>3XL</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("4XL") ? prev.filter( item => item !== "4XL") : [...prev,"4XL"])}>
                  <p className={`${sizes.includes("4XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>4XL</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("5XL") ? prev.filter( item => item !== "5XL") : [...prev,"5XL"])}>
                  <p className={`${sizes.includes("5XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>5XL</p>
                </div>

                <div onClick={()=>setSizes(prev => prev.includes("6XL") ? prev.filter( item => item !== "6XL") : [...prev,"6XL"])}>
                  <p className={`${sizes.includes("6XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>6XL</p>
                </div>
                <div onClick={()=>setSizes(prev => prev.includes("7XL") ? prev.filter( item => item !== "7XL") : [...prev,"7XL"])}>
                  <p className={`${sizes.includes("7XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>7XL</p>
                </div>
              </div>
            </div>
         
            <div className='mt-4'>
              <p className='mb-2'>Stock per Size</p>
              <div className='grid grid-cols-3 gap-2'>
                {sizes.map(size => (
                  <div key={size} className='flex items-center'>
                    <span className='mr-2 w-8'>{size}:</span>
                    <input
                      type="number"
                      min="0"
                      value={stock[size] || 0}
                      onChange={(e) => setStock({...stock, [size]: parseInt(e.target.value)})}
                      className='w-full px-2 py-1 border'
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className='mt-4'>
            <p className='mb-2'>Stock</p>
            <input
              type="number"
              min="0"
              value={stock.value || 0}
              onChange={(e) => setStock({ value: parseInt(e.target.value) })}
              className='w-full max-w-[120px] px-2 py-1 border'
            />
          </div>
        )}

        <div className='flex gap-2 mt-2'>
          <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
          <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
        </div>
        <div className="mt-4 w-full max-w-[500px]">
          <p className="mb-2">Occasion</p>
          <div className="flex gap-4">
            {['Designer', 'Casual', 'Formal'].map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={occasion.includes(item)}
                  onChange={() => {
                    if (occasion.includes(item)) {
                      setOccasion(occasion.filter(i => i !== item));
                    } else {
                      setOccasion([...occasion, item]);
                    }
                  }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4 w-full max-w-[500px]">
          <p className="mb-2">Type</p>
          <div className="flex gap-4">
            {['Printed', 'Embroidered', 'Plain'].map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={type.includes(item)}
                  onChange={() => {
                    if (type.includes(item)) {
                      setType(type.filter(i => i !== item));
                    } else {
                      setType([...type, item]);
                    }
                  }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 w-full max-w-[500px]">
          <p className="mb-2">Dynamic Filter Tags (comma separated)</p>
          <input
            type="text"
            value={filterTags.join(', ')}
            onChange={(e) => setFilterTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            placeholder="e.g. Cotton, Red, Long Sleeves"
            className="w-full px-3 py-2 border"
          />
        </div>

        <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>

    </form>
  )
}

export default Add