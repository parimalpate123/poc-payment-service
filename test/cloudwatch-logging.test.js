const AWS = require('aws-sdk-mock');
const { expect } = require('chai');
const sinon = require('sinon');

describe('CloudWatch Logging', () => {
  beforeEach(() => {
    AWS.mock('CloudWatchLogs', 'createLogStream', (params, callback) => {
      callback(null, {});
    });
  });

  afterEach(() => {
    AWS.restore('CloudWatchLogs');
  });

  it('should create a CloudWatch log stream on server start', (done) => {
    const consoleSpy = sinon.spy(console, 'log');
    
    require('../src/index');

    setTimeout(() => {
      expect(consoleSpy.calledWith('CloudWatch log stream created successfully')).to.be.true;
      consoleSpy.restore();
      done();
    }, 100);
  });

  it('should handle errors when creating CloudWatch log stream', (done) => {
    AWS.restore('CloudWatchLogs');
    AWS.mock('CloudWatchLogs', 'createLogStream', (params, callback) => {
      callback(new Error('Mocked error'));
    });

    const consoleErrorSpy = sinon.spy(console, 'error');
    
    require('../src/index');

    setTimeout(() => {
      expect(consoleErrorSpy.calledWith('Error creating CloudWatch log stream:')).to.be.true;
      consoleErrorSpy.restore();
      done();
    }, 100);
  });
});