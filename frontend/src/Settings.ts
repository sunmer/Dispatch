const SETTINGS_DEV = {
  WEB_URL: "http://127.0.0.1:5173",
  API_URL: "http://127.0.0.1:3000/api",
  API_KEY_MAGIC: "pk_live_3664465CE0411AAD",
  API_KEY_ALCHEMY: "SXHnBp_eYEQgf2PZvlJ5MegYtoCKpEBG",
  IRYS_URL: 'https://gateway.irys.xyz/'
}

const SETTINGS_PROD = {
  WEB_URL: "https://www.dispatch.bio/",
  API_URL: "https://www.dispatch.bio//api",
  API_KEY_MAGIC: "pk_live_3664465CE0411AAD",
  API_KEY_ALCHEMY: "SXHnBp_eYEQgf2PZvlJ5MegYtoCKpEBG",
  IRYS_URL: 'https://gateway.irys.xyz/'
};


const Settings = import.meta.env.PROD ? SETTINGS_PROD : SETTINGS_DEV;

export default Settings;