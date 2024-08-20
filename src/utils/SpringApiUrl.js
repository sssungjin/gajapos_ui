const env = process.env.REACT_APP_ENVIRONMENT;

const SPRING_API_URL =
  env === "prod"
    ? process.env.REACT_APP_SPRING_PROD_API_URL
    : process.env.REACT_APP_SPRING_DEV_API_URL;

export default SPRING_API_URL;
