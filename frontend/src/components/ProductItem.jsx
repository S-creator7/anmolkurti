import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer flex flex-col w-full h-full p-4 bg-white rounded border overflow-hidden justify-between hover:shadow-lg transition-all duration-300"
      to={`/product/${id}`}
    >
      <div className="w-full h-2/3 overflow-hidden flex items-center justify-center">
        <img
          className="w-full h-full object-cover hover:scale-110 transition ease-in-out"
          src={image[0]}
          alt={name}
        />
      </div>
      <div className="flex flex-col items-center justify-center mt-2">
        <p className="pt-1 pb-1 text-sm text-center truncate">{name}</p>
        <p className="text-sm font-medium text-center">{currency}{price}</p>
      </div>
    </Link>
  );
};

export default ProductItem;
