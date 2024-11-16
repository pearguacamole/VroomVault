import React from 'react';

const DocsPage = () => {
  return (
    <div style={{ height: '100vh', margin: 0 }}>
      <iframe
        src="https://kushagra.info.gf/redoc"
        width="100%"
        height="100%"
        title="ReDoc"
        style={{ border: 'none', height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default DocsPage;
