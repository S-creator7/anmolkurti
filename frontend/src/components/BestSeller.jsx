import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { bestsellers, fetchBestsellers } = useContext(ShopContext);

  useEffect(() => {
    fetchBestsellers();
  }, []);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover the most loved Kurtis from Anmol Kurti! Our Bestseller collection features the designs that our customers can’t get enough of.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestsellers?.slice(0, 5)?.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.productName}   // 👈 note: backend sends productName
            image={item.image}        // adjust if your backend returns image differently
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
