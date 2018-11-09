const nunjucks = require('nunjucks');

// Prepare nunjucks environment
const loader = new nunjucks.FileSystemLoader('templates');
const env = new nunjucks.Environment(loader);

// Add module translation filder
env.addFilter('translate', (key) => {
    return `translated: ${key}`;
});

/**
 * renderTemplate - Render template in 'templated' folder with given data.
 *
 * @param  {String}  template Template to be rendered
 * @param  {Object}  data     Data to put into the template
 * @return {Promise}          Promise resolved with rendered HTML
 */
function renderTemplate(template, data) {

    return new Promise((resolve, reject) => {
        env.render(template, data, (err, res) => {

            if (err) {
                reject(err);
            }

            resolve(res);
        });
    });
}

// Export function
module.exports.renderTemplate = renderTemplate;
