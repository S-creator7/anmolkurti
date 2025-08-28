import ProductList from './ProductList';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';

const Collection = () => {
  return (
    <div>
      <div className='flex flex-col lg:flex-row gap-4 pt-6 sm:pt-10 border-t'>
        <ProductList />
      </div>
      {/* <BestSeller />
      <OurPolicy /> */}
      {/* <NewsletterBox /> */}
    </div>
  );
};

export default Collection;
