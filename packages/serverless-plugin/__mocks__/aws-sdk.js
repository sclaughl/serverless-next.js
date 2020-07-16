const promisify = mockFunction => {
  const mockPromise = jest.fn(() => Promise.resolve());
  mockFunction.mockReturnValue({
    promise: mockPromise
  });

  return {
    mockFunction,
    mockPromise
  };
};

const MockCloudWatchLogs = function() {};
function MockEnvironmentCredentials() {}
function MockCloudFormation() {}

const {
  mockFunction: mockDescribeStacks,
  mockPromise: mockDescribeStacksPromise
} = promisify(jest.fn());

const {
  mockFunction: mockCreateStack,
  mockPromise: mockCreateStackPromise
} = promisify(jest.fn());

const {
  mockFunction: mockDescribeStackEvents,
  mockPromise: mockDescribeStackEventsPromise
} = promisify(jest.fn());

const {
  mockFunction: mockDescribeStackResource,
  mockPromise: mockDescribeStackResourcePromise
} = promisify(jest.fn());

const {
  mockFunction: mockValidateTemplate,
  mockPromise: mockValidateTemplatePromise
} = promisify(jest.fn());

const {
  mockFunction: mockUpdateStack,
  mockPromise: mockUpdateStackPromise
} = promisify(jest.fn());

const {
  mockFunction: mockListStackResources,
  mockPromise: mockListStackResourcesPromise
} = promisify(jest.fn());

MockCloudFormation.prototype.describeStacks = mockDescribeStacks;
MockCloudFormation.prototype.createStack = mockCreateStack;
MockCloudFormation.prototype.describeStackEvents = mockDescribeStackEvents;
MockCloudFormation.prototype.describeStackResource = mockDescribeStackResource;
MockCloudFormation.prototype.validateTemplate = mockValidateTemplate;
MockCloudFormation.prototype.updateStack = mockUpdateStack;
MockCloudFormation.prototype.listStackResources = mockListStackResources;

const {
  mockFunction: mockListObjectsV2,
  mockPromise: mockListObjectsV2Promise
} = promisify(jest.fn());

const S3MockUpload = promisify(jest.fn());

const MockSTS = function() {};
const {
  mockFunction: mockGetCallerIdentity,
  mockPromise: mockGetCallerIdentityPromise
} = promisify(jest.fn());
MockSTS.prototype.getCallerIdentity = mockGetCallerIdentity;

const MockAPIGateway = function() {};
const {
  mockFunction: mockGetRestApis,
  mockPromise: mockGetRestApisPromise
} = promisify(jest.fn());
MockAPIGateway.prototype.getRestApis = mockGetRestApis;

const MockSharedIniFileCredentials = function() {};

const MockMetadataService = function() {};
const mockMetadataRequest = jest
  .fn()
  .mockImplementation((path, cb) => cb(null, {}));
MockMetadataService.prototype.request = mockMetadataRequest;

module.exports = {
  EnvironmentCredentials: MockEnvironmentCredentials,
  S3: jest.fn(() => {
    return {
      upload: S3MockUpload.mockFunction,
      listObjectsV2: mockListObjectsV2
    };
  }),
  CloudFormation: MockCloudFormation,
  CloudWatchLogs: MockCloudWatchLogs,
  STS: MockSTS,
  APIGateway: MockAPIGateway,
  SharedIniFileCredentials: MockSharedIniFileCredentials,
  MetadataService: MockMetadataService,

  mockDescribeStacks,
  mockDescribeStacksPromise,
  mockCreateStack,
  mockCreateStackPromise,
  mockDescribeStackEvents,
  mockDescribeStackEventsPromise,
  mockDescribeStackResource,
  mockDescribeStackResourcePromise,
  mockListObjectsV2,
  mockListObjectsV2Promise,
  mockGetCallerIdentity,
  mockGetCallerIdentityPromise,
  mockUpload: S3MockUpload.mockFunction,
  mockUploadPromise: S3MockUpload.mockPromise,
  mockUpdateStack,
  mockUpdateStackPromise,
  mockListStackResources,
  mockListStackResourcesPromise,
  mockGetRestApis,
  mockGetRestApisPromise,
  mockValidateTemplate,
  mockValidateTemplatePromise
};
