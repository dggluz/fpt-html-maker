'use strict';

$(document).ready(function() {
	var youtubeUrlRegex = /^(https?\:\/\/)?[a-z0-9\.]*(youtube\.com|youtu\.be)/i;

	var getYoutubeId = function(url) {
		var youTubeVideoId;
		var search = url.split('?')[1];
		youTubeVideoId = search.split('v=')[1];
		var ampersandPosition = youTubeVideoId.indexOf('&');
		if(ampersandPosition != -1) {
			youTubeVideoId = youTubeVideoId.substring(0, ampersandPosition);
		}
		var hashPosition = youTubeVideoId.indexOf('#');
		if(hashPosition != -1) {
			youTubeVideoId = youTubeVideoId.substring(0, hashPosition);
		}
		return youTubeVideoId;
	};


	$('#make').click(function() {
		var urls = $('#url').val().split('\n').map(function(aUrl) {
			return aUrl.trim();
		}).filter(function(aUrl) {
			return aUrl;
		});

		var validas = urls.every(function(aUrl) {
			var youTubeVideoId = getYoutubeId(aUrl);
			if(!youtubeUrlRegex.test(aUrl) || !youTubeVideoId) {
				alert('La URL "' + aUrl + '" no es válida');
				$('#url').focus();
				return false;
			}
			return true;
		});

		if(!validas) {
			return;
		}

		Promise.all(urls.map(getHtml)).then(function(htmlChunks) {
			$('#output').text(htmlChunks.reduce(function(total, aChunk) {
				return total + aChunk;
			}), '');
		});
	});

	var getHtml = function(url) {
		var youTubeVideoId = getYoutubeId(url);

		return new Promise(function(fulfill, reject) {
			$.ajax({
				type: 'GET',
				url: 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + youTubeVideoId + '&key=AIzaSyCf9WOPbY_3QjPQ7U7E-6Uuhw61AkwzmVo',
				xhrFields: {
					withCredentials: false
				},
				success: function (data) {
					fulfill(data.items[0].snippet);
				},
				error: function (req, stat, err) {
					reject(err);
				}
			});
		}).then(function(youtubeData) {
			var description = youtubeData.title.replace(/\"/g, '&quot;');
			var img = '';
			['standard', 'high', 'medium', 'default'].forEach(function(size) {
				if(!img && youtubeData.thumbnails[size]) {
					img = youtubeData.thumbnails[size].url;
				}
			});

			return '<a href="' + url + '" target="_system"><img src="' + img + '" alt="' + description + '" width="100%" ><br />' + description + '</a><br />';
		});
	};
});