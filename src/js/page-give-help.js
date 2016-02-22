// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')


nav.init()
analytics.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './needs', './template-render', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var templating = require('./template-render')
  var Spinner = require('spin.js')
  var staticNeeds = require('./needs')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get API data using promise
  getApiData.data(apiRoutes.needs).then(function (result) {
    var needsFromApi = result.data
    var needsToUse = needsFromApi.length < 1 ? staticNeeds : needsFromApi

    var callback = function () {
      loading.stop()
      //socialShare.init()
    }

    templating.renderTemplate('js-need-list-tpl', needsToUse, 'js-need-list-output', callback)
  })
})