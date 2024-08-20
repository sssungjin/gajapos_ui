const env = process.env.REACT_APP_ENVIRONMENT;

const JEPETTO_API_URL =
  env === "prod"
    ? process.env.REACT_APP_JEPETTO_PROD_API_URL
    : process.env.REACT_APP_JEPETTO_DEV_API_URL;

export default JEPETTO_API_URL;
