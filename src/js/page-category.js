import './common'

let accordion = require('./accordion')
let FindHelp = require('./find-help')
let apiRoutes = require('./api')

let forEach = require('lodash/collection/forEach')

let getApiData = require('./get-api-data')
let templating = require('./template-render')
let analytics = require('./analytics')
let socialShare = require('./social-share')
let browser = require('./browser')

let findHelp = new FindHelp()
findHelp.handleSubCategoryChange('sub-category', accordion)
findHelp.buildCategories(apiRoutes.servicesByCategory, buildList)

function buildList (url) {
  browser.loading()

  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    let theTitle = result.data.category.name + ' - Street Support'
    document.title = theTitle

    let template = ''
    let callback = function () {
      browser.loaded()
      socialShare.init()
    }

    let formattedProviders = []

    if (result.data.providers.length > 0) {
      template = 'js-category-result-tpl'

      forEach(result.data.providers, function (provider) {
        let service = {
          info: provider.info,
          location: provider.location,
          openingTimes: provider.openingTimes
        }
        let match = formattedProviders.filter((p) => p.providerId === provider.providerId)

        if (match.length === 1) {
          match[0].services.push(service)
        } else {
          let newProvider = {
            providerId: provider.providerId,
            providerName: provider.providerName,
            services: [service]
          }
          if (provider.tags !== null) {
            newProvider.tags = provider.tags.join(', ')
          }
          if (provider.subCategories !== null) {
            newProvider.subCategories = provider.subCategories
              .map((sc) => sc.name)
              .join(', ')
          }
          formattedProviders.push(newProvider)
        }
      })
      callback = function () {
        accordion.init(true, 0, findHelp.buildListener('category', 'service-provider'))
        browser.loaded()
        socialShare.init()
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    analytics.init(theTitle)

    var formattedData = {
      category: result.data.category,
      providers: formattedProviders
    }

    let viewModel = findHelp.buildViewModel('category', formattedData)

    templating.renderTemplate(template, viewModel, 'js-category-result-output', callback)
  })
}
