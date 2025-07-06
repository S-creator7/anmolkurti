import ProductList from './ProductList';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';
import ScrollToTop from "../components/scrollToTop";

const Collection = () => {
  return (
    <div>
      <ScrollToTop />
      <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
        <ProductList />
      </div>
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Collection;
