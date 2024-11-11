import React from 'react';

const LearningPathIntro: React.FC = () => {
  const heroStyles = {
    position: 'relative' as const,
    height: '50vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ECEDEE',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    padding: '0 20px',
  };

  const overlayStyles = {
    position: 'absolute' as const,
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.65)), radial-gradient(circle, rgba(0, 0, 0, 0.3) 10%, transparent 60%)',
    backgroundBlendMode: 'overlay, normal',
    animation: 'gradientShift 15s ease-in-out infinite',
  };

  const noiseOverlayStyles = {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: 'url(/assets/noise-texture.png)',
    opacity: 0.08,
    zIndex: 1,
    pointerEvents: 'none' as const,
  };

  const contentStyles = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '800px',
    textAlign: 'center' as const,
    fontFamily: 'Satoshi, sans-serif',
  };

  const titleStyles = {
    fontSize: '3.5rem',
    fontWeight: 500,
    lineHeight: 1.1,
    color: '#ECEDEE',
    position: 'relative' as const,
    display: 'inline-block',
    marginBottom: '1rem',
    paddingBottom: '10px',
    letterSpacing: '0.5px',
  };

  const underlineStyles = {
    position: 'absolute' as const,
    bottom: -3,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 20px)',
    height: '3px',
    backgroundColor:'#9E1F19', 
    borderRadius:'1.5px', 
    boxShadow:'0px 0px 4px rgba(158,31,25,0.4)',
  };

  const subtitleStyles = {
    fontSize: '1.1rem',
    marginBottom: '2rem',
    lineHeight: 1.4,
    color:'#ECEDEE', 
    fontWeight:'500', 
    paddingLeft:'10px', 
     paddingRight:'10px'
   };

   return (
     <section style={heroStyles}>
       <div style={overlayStyles} />
       <div style={noiseOverlayStyles} />
       <div style={contentStyles}>
         <h2 style={titleStyles}>
           Developer Learning Paths
           <div style={underlineStyles}></div>
         </h2>
         <p style={subtitleStyles}>
           Begin your development journey with Sei by following a structured learning path.
         </p>
       </div>
     </section>
   );
};

export default LearningPathIntro;