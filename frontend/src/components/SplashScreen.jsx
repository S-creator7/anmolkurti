import React from 'react';
import logo from '../assets/transparentLogo.png';

const SplashScreen = ({ finishLoading }) => {
  React.useEffect(() => {
    setTimeout(() => {
      finishLoading();
    }, 3300); // Match total animation duration
  }, []);

  return (
    <div className="splash-screen">
      <div className="expanding-circle" />
      <img src={logo} alt="Anmol Sarees" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;