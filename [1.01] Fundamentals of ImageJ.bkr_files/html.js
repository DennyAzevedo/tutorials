/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * HTML eval plugin
 * For creating and config evaluators that evaluate HTML code and update code cell results.
 */
define(function(require, exports, module) {
  'use strict';
  var PLUGIN_NAME = "HTML";
  var Html = {
    pluginName: PLUGIN_NAME,
    cmMode:  "smartHTMLMode",
    bgColor: "#E3502B",
    fgColor: "#FFFFFF",
    borderColor: "",
    shortName: "Ht",
    tooltip: "HTML stands for hyper text markup language, including CSS.",
    evaluate: function(code, modelOutput) {
      var deferred = bkHelper.newDeferred();
      bkHelper.timeout(function () {
        try {
          var startTime = new Date().getTime();
          var beaker = bkHelper.getNotebookModel().namespace; // this is visible to JS code in cell
          if (undefined === beaker) {
            bkHelper.getNotebookModel().namespace = {};
          }
        
          var precode = "<script>\n"+
          "var beaker = bkHelper.getBeakerObject().beakerObj;\n"+
          "</script>\n";
          
          bkHelper.evaluateJSinHTML(code, bkHelper.evaluateCode)
          .then(function (transformedHtml) {
            modelOutput.result = {
                type: "BeakerDisplay",
                innertype: "Html",
                object: precode+transformedHtml
              };
            modelOutput.elapsedTime = new Date().getTime() - startTime;
            deferred.resolve("");   
          });

        } catch (err) {
          modelOutput.result = {
              type: "BeakerDisplay",
              innertype: "Error",
              object: "" + err
          };
          deferred.reject(modelOutput.result);
        }
      }, 0);
      return deferred.promise;
    },
    spec: {
    }
  };
  var Html0 = function(settings) {
    if (!settings.view) {
      settings.view = {};
    }
    if (!settings.view.cm) {
      settings.view.cm = {};
    }
    
    CodeMirror.defineMode("smartHTMLMode", function(config) {
      return CodeMirror.multiplexingMode(
        CodeMirror.getMode(config, "htmlmixed"),
        {open: "{{", close: "}}",  mode: CodeMirror.getMode(config, "javascript"),  delimStyle: "delimit"}
      );
    });
    
    settings.view.cm.mode = Html.cmMode;
    this.settings = settings;
  };
  Html0.prototype = Html;

  exports.getEvaluatorFactory = function() {
    return bkHelper.getEvaluatorFactory(bkHelper.newPromise(Html0));
  };
  exports.name = PLUGIN_NAME;
});
