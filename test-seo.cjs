const http = require('http');

function fetchAndParse(url) {
  http.get(url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      const matchLang = data.match(/<html[^>]*lang="([^"]+)"/i);
      console.log(`URL: ${url}`);
      console.log(`lang: ${matchLang ? matchLang[1] : 'NOT FOUND'}`);

      const matchTitle = data.match(/<title[^>]*>([^<]+)<\/title>/i);
      console.log(`title: ${matchTitle ? matchTitle[1] : 'NOT FOUND'}`);

      const regex = /<meta[^>]*(name|property)="([^"]+)"[^>]*content="([^"]+)"[^>]*>/gi;
      let m;
      while ((m = regex.exec(data)) !== null) {
        if (m[2].includes('og:') || m[2].includes('description')) {
          console.log(`${m[2]}: ${m[3]}`);
        }
      }
      console.log('---');
    });
  });
}

fetchAndParse('http://localhost:3000/');
fetchAndParse('http://localhost:3000/activity/act_1');
