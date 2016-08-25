// Common modules
import './common'

// Page modules
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var FindHelp = require('./find-help')

// Lodash
var forEach = require('lodash/collection/forEach')
var sortBy = require('lodash/collection/sortBy')
var slice = require('lodash/array/slice')
var findIndex = require('lodash/array/findIndex')

var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var templating = require('./template-render')
var analytics = require('./analytics')
var socialShare = require('./social-share')
var browser = require('./browser')

var findHelp = new FindHelp()
findHelp.handleSubCategoryChange('day', accordion)
findHelp.buildTimeTabledCategories(apiRoutes.categoryServiceProvidersByDay, buildList)

function buildList (url) {
  browser.loading()

  getApiData.data(url).then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    var data = result.data

    var theTitle = data.categoryName + ' - Street Support'
    document.title = theTitle

    var template = ''
    var callback = function () {}

    if (data.daysServices.length) {
      template = 'js-category-result-tpl'

      data.daysServices = sortByOpeningTimes(sortDaysFromToday(data.daysServices))

      forEach(data.daysServices, function (subCat) {
        forEach(subCat.serviceProviders, function (provider) {
          if (provider.tags !== null) {
            provider.tags = provider.tags.join(', ')
          }
        })
      })

      var dayIndexToOpen = findIndex(data.daysServices, function (day) {
        return day.name === urlParameter.parameter('day')
      })

      callback = function () {
        accordion.init(true, dayIndexToOpen, findHelp.buildListener('category-by-day', 'day'))
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    templating.renderTemplate(template, findHelp.buildViewModel('category-by-day', data), 'js-category-result-output', callback)

    browser.loaded()
    analytics.init(theTitle)
    socialShare.init()
  })
}

function sortByOpeningTimes (days) {
  forEach(days, function (day) {
    day.serviceProviders = sortBy(day.serviceProviders, function (provider) {
      return provider.openingTime.startTime
    })
  })
  return days
}

function sortDaysFromToday (days) {
  // api days: monday == 0!
  var today = new Date().getDay() - 1
  var past = slice(days, 0, today)
  var todayToTail = slice(days, today)
  return todayToTail.concat(past)
}
