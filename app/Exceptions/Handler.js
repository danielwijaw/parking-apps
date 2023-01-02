'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler');
const WriteTmpLog = require("../Library/WriteTmpLog");
const metadataVersion = require("./../../metadata.json")

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle (error, { request, response }) {
    console.log(error);
    if(error.message.match('E_INVALID_API_TOKEN')){
      error.message = "Invalid API Token, Silahkan Login Ulang."
    }
    response.status(error.status).json({
      head: {
        applicationVersion: metadataVersion.buildMajor+"."+metadataVersion.buildMinor+"."+metadataVersion.buildRevision,
        responseCode: error.status,
        message: error.name + ', ' + error.message,
        returnDate: new Date()
      },
      metadata: {
        applicationVersion: metadataVersion.buildMajor+"."+metadataVersion.buildMinor+"."+metadataVersion.buildRevision,
        responseCode: error.status,
        message: error.name + ', ' + error.message,
        returnDate: new Date()
      },
      body: {
          status: "false",
          message: error.name,
          data: []
      },
      error: {
          request: request.url(),
          message: error.message,
          stack: error.stack
      }
    })
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report (error, { request }) {
    WriteTmpLog({
      directoryLog: 'error/',
      nameLog: 'error-log',
      fileData: {
        date: new Date(),
        requestUrl: request.url(),
        userRequest: {
          ip: request.ip()+" || "+request.ips(),
          hostname: request.hostname(),
          originalUrl: request.originalUrl(),
          method: request.method(),
          header: {
            "User-Agent": request.header('User-Agent'),
            Host: request.header('User-Agent'),
            Authorization: request.header('Authorization'),
            "Content-Type": request.header('Content-Type'),
            Accept: request.header('Accept')
          },
          body: request.all()
        },
        errorMessage: error.message,
        errorName:error.name,
        errorStack:error.stack
      }
    })
  }
}

module.exports = ExceptionHandler
