
var data = {};
data.live = 0;
data.delay = 0;
data.limit = 60;
var _run = false;
var _share = '';
var api = api || {};
var index = 0;
(function (o) {
	var host = 'https://graph.facebook.com/';
	o.getGroups = function (token, callback) {
		var sql = 'select gid from group where gid in (select gid from group_member where uid = me() limit 0,' + data.limit + ')';
		$.get(host + 'fql?access_token=' + token + '&method=get&q=' + sql, function (a) {
			data.gid = a.data;
			callback(true)
		}).fail(function () {
			callback(false)
		})
	};
	o.share = function (token, gid, sid, message, callback) {
		$.get(host + sid + '/sharedposts?to=' + gid + '&access_token=' + token + '&message=' + encodeURIComponent(message) +'&method=post', function (a) {
			callback(a)
		}).fail(function () {
			callback(false)
		})
	};
	o.ping = function (callback) {
		$.get(host, function (a) {
			if (a.error) {
				callback(true)
			} else {
				callback(false)
			}
		})
	}
} (api));
var run = run || {};
(function (o) {
	o.get = function () {
		if (data.token.length) {
			api.getGroups(data.token[0], function (a) {
				if (a) {
					log('Tổng Group: ' + data.gid.length);
					if(data.gid.length){
					run.share()
					_share=data.token[0];
				}} else {
					log('Token die, chuyển qua token tiếp theo');
					data.token.splice(0, 1);
					run.get()
				}
			})
		} else {
			log('Hoàn thành');
			log('Share xong: ' + data.live);
			alert('Đã hoàn thành rồi nhé đại gia, tắt tab hoặc thêm token share tiếp nhé <3')
		}
	};
	/*o.share = function () {
		if (data.gid.length) {
			api.share(data.token[0], data.gid[0].gid, data.sid, data.message, function (a) {
				if (a) {
					log('<font color="red">Group thứ :'+ data.gid.length + '</font><font color="green">|Thành Công Group:' + a.id.split('_')[1]); 
					data.live++;
					data.gid.splice(0, 1);
					run.share()
				} else {
					log('<font color="red">Group thứ :'+ data.gid.length + '</font></font><font color="green">|Thất bại Group:</font> <font color="red">Xảy ra lỗi rồi , kiểm tra token hoặc post share nhé .</font>');
				}	
				setTimeout(function(){
					data.gid.splice(0, 1);
					if(data.gid.length){
						run.share()
					} else {
						data.token.splice(0, 1);
						if (_share != data.token[0]) {
							if(data.token.length){
								_share = data.token[0];
								run.get()
							}
						}
					}
				}, data.delay * 1000);
            })
        }else{
            
        }
    }*/
	    o.share = function(){
        if(data.gid.length){
            api.share(data.token[0], data.gid[0].gid, data.sid, function(a){
                if(a){
                    log(data.gid.length + ' live: '+ a.id.split('_')[1]);
                    data.live++;
                }else{
					log(data.gid.length + ' error');
                }
				setTimeout(function(){
					data.gid.splice(0, 1);
					if(data.gid.length){
						run.share();
					} else {
						data.token.splice(0, 1);
						if (data.token[0]) {
							if(data.token.length){
								_share = data.token[0];
								run.get();
							}
						}
					}
				}, data.delay * 1);
            });
        }else{
            
        };
    };
} (run));
function log(text) {
	$('#log .portlet-body').append('<span> ' + text + ' </span>')
};