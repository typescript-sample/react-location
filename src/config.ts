const localConfigUrl = {
  authentication_url: 'http://localhost:8080',
  signup_url: 'http://localhost:8080/signup',
  password_url: 'http://localhost:8080/password',
  oauth2_url: 'http://localhost:8080/oauth2',

  user_url: 'http://localhost:8080/users',
  role_url: 'http://localhost:8080/roles',
  privilege_url: 'http://localhost:8080/privileges',
  audit_log_url: 'http://localhost:8080/audit-logs',

  myprofileUrl: 'http://localhost:3003',

  contentUrl: 'http://localhost:8080/contentCategory',
  contentImageUrl: 'http://localhost:8080/contentImages',
  articleUrl: 'http://localhost:8080/articles',
  albumUrl: 'http://localhost:8080/album',
  commentUrl: 'http://localhost:8080/comments',
  driveUrl: 'http://localhost:8080/drive',

  cloudinary: {
    apiKey: '441159193862824',
    apiSecret: 'NNoe_5UkF92ZbuKHlE6lsFsZAJg',
    unsignedUploadPreset: 'dtqwquw3',
    cloudinaryName: 'phu-hu-nh',
  },
  authenticationServiceUrl: 'http://10.1.0.234:3003',
  authorizationServiceUrl: 'http://10.1.0.234:3003',
  passwordServiceUrl: 'http://10.1.0.234:3003',
  userRegistrationServiceUrl: 'http://10.1.0.234:3003',
  userServiceUrl: 'http://10.1.0.234:3003/users',
  groupServiceUrl: 'http://10.1.0.234:3003/groups',
  roleServiceUrl: 'http://10.1.0.234:3003/roles',
  moduleServiceUrl: 'http://10.1.0.234:3003/modules',
  memberServiceUrl: 'http://10.1.0.234:3003/members',
  myprofileServiceUrl: 'http://10.1.0.234:3003',
  contentServiceUrl: 'http://10.1.0.234:3003/contentCategory',
  contentImageServiceUrl: 'http://10.1.0.234:3003/contentImages',
  articleServiceUrl: 'http://10.1.0.234:3003/articles',
  albumServiceUrl: 'http://10.1.0.234:3003/album',
  commentServiceUrl: 'http://10.1.0.234:3003/comments',
  submitUrl: 'http://10.1.0.234:3003/comments',
  apiKey: '441159193862824',
  apiSecret: 'NNoe_5UkF92ZbuKHlE6lsFsZAJg',
  unsignedUploadPreset: 'dtqwquw3',
  cloudinaryName: 'phu-hu-nh',
};

const sitConfigUrl = {
  authentication_url: 'http://10.1.0.234:3003',
  signup_url: 'http://10.1.0.234:3003',
  password_url: 'http://10.1.0.234:3003',
  oauth2_url: 'http://10.1.0.234:3003',

  myprofileUrl: 'http://10.1.0.234:8080',

  contentUrl: 'http://10.1.0.234:8080/contentCategory',
  contentImageUrl: 'http://10.1.0.234:8080/contentImages',
  articleUrl: 'http://10.1.0.234:8080/articles',
  albumUrl: 'http://10.1.0.234:8080/album',
  commentUrl: 'http://10.1.0.234:8080/comments',
  driveUrl: 'http://10.1.0.234:8080/drive',
  cloudinary: {
    apiKey: '441159193862824',
    apiSecret: 'NNoe_5UkF92ZbuKHlE6lsFsZAJg',
    unsignedUploadPreset: 'dtqwquw3',
    cloudinaryName: 'phu-hu-nh',
  },

  authenticationServiceUrl: 'http://10.1.0.234:3003',
  authorizationServiceUrl: 'http://10.1.0.234:3003',
  passwordServiceUrl: 'http://10.1.0.234:3003',
  userRegistrationServiceUrl: 'http://10.1.0.234:3003',
  userServiceUrl: 'http://10.1.0.234:3003/users',
  groupServiceUrl: 'http://10.1.0.234:3003/groups',
  roleServiceUrl: 'http://10.1.0.234:3003/roles',
  moduleServiceUrl: 'http://10.1.0.234:3003/modules',
  memberServiceUrl: 'http://10.1.0.234:3003/members',
  myprofileServiceUrl: 'http://10.1.0.234:3003',
  contentServiceUrl: 'http://10.1.0.234:3003/contentCategory',
  contentImageServiceUrl: 'http://10.1.0.234:3003/contentImages',
  articleServiceUrl: 'http://10.1.0.234:3003/articles',
  albumServiceUrl: 'http://10.1.0.234:3003/album',
  commentServiceUrl: 'http://10.1.0.234:3003/comments',
  apiKey: '441159193862824',
  apiSecret: 'NNoe_5UkF92ZbuKHlE6lsFsZAJg',
  unsignedUploadPreset: 'dtqwquw3',
  cloudinaryName: 'phu-hu-nh',
};

const deployConfigUrl = {
  authentication_url: '/server',
  signup_url: '/server',
  password_url: '/server',
  oauth2_url: 'server',

  myprofileUrl: '/server',

  contentUrl: '/server/contentCategory',
  contentImageUrl: '/server/contentImages',
  articleUrl: '/server/articles',
  albumUrl: '/server/album',
  commentUrl: '/server/comments',
  driveUrl: '/server/drive',
  cloudinary: {
    apiKey: '441159193862824',
    apiSecret: 'NNoe_5UkF92ZbuKHlE6lsFsZAJg',
    unsignedUploadPreset: 'dtqwquw3',
    cloudinaryName: 'phu-hu-nh',
  },
};

const config = process.env.REACT_APP_ENV === 'DEPLOY' ? deployConfigUrl : (process.env.REACT_APP_ENV === 'SIT' ? sitConfigUrl : localConfigUrl);

export default config;
