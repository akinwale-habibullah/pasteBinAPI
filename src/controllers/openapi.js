import path from 'path';
import redoc from 'redoc-express';

// return openAPI doc file
const getDocs = (req, res) => {
  res.sendFile('openapi.json', { root: path.join(process.cwd(), 'openapi') });
};

// return redoc
const getAPIDoc = redoc({
  title: 'Forum API Docs',
  specUrl: '/api-docs/docs'
});

export {
  getDocs,
  getAPIDoc
}
