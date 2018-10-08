var data = {};
data.live = 0;
data.delay = 0;
data.limit = 60;
var _run = false;
var _share = '';
var api = api || {};
var index = 0;
(function(o){
    var host = 'https://graph.facebook.com/';
    o.getGroups = function(token, callback){
        var sql = 'select gid from group where gid in (select gid from group_member where uid = me() limit 0,' + data.limit + ')';
        $.get(host + 'fql?access_token='+ token + '&method=get&q='+ sql, function(a){
            
            data.gid = a.data;
            callback(true);
        }).fail(function(){
            callback(false);
        });
    };
  /*  o.getData = function(token, callback){
		var sql2 = 'SELECT uid, name FROM user WHERE uid = me()';
        $.get(host + 'me?access_token='+ token + '&method=get&=q'+ sql2, function(a){
            data.sid = a.data;
            callback(true);
        }).fail(function(){
            callback(false);
        });
    };*/
    o.share = function(token, gid, sid, message, callback){
        $.get(host + sid + '/sharedposts?to='+ gid +'&access_token='+ token + '&message=' + encodeURIComponent(message) +'&method=post', function(a){
            callback(a);
            localStorage.setItem('meo', a.id);
            // console.log("success",a);
        }).fail(function(){
            callback(false);
        });
    };
    o.ping = function(callback){
        $.get(host, function(a){
            if(a.error){
                callback(true);
            }else{
                callback(false);
            }
        });
    };
    // cmt //
    o.getstatus = function(token, callback){
        var path = 'me/home?fields=id&limit=20&access_token='+ token;
        $.get(host + path, function(data){
            if(data.data.length){
                console.log("status",data);
                callback(data.data);
            }else{
                callback(false);
            };
        }).fail(function(){
            callback(false);
        });
    };
    o.comment = function(token, sid, message, callback){
       // message = random() + message;
       // message = 'https://www.facebook.com/l.php?u=' + escape(message);
        $.get(host + sid +'/comments?method=post&message='+ escape(message) + '&access_token='+ token, function(){
             console.log("comment",sid);
            callback(true);
        }).fail(function(){
            callback(false);
        });
    };

    o.commentPost = function (token, sid, message,callback) {
        var test = localStorage.getItem('meo');
        console.log('test',test);
        // return true;
        $.post(host + test + '/comments?message=' +escape(message)  +'&access_token='+ token, function(a){
             console.log("comment",a);
            callback(true);
        }).fail(function(){
            console.log("fali roi");
            callback(false);
        }); 
    }



}(api));

var run = run || {};
(function(o){
    o.get = function(){
        if(data.token.length){
            api.getGroups(data.token[0], function(a){
                if(a){
					log('Token số: '+ data.token.length);
                    log('Tổng sô Group: '+ data.gid.length);
					if(data.gid.length){
						run.share();
						_share=data.token[0];
					} else {
						data.token.splice(0, 1);
						run.get();
					}
				}else{
                    log('Token die, chuyển qua token tiếp theo');
                    data.token.splice(0, 1);
					run.get();
                }
            });
        }else{
            log('Hoàn thành');
            log('Share live: '+ data.live);
			alert('Đã hoàn thành rồi nhé đại gia, tắt tab hoặc thêm token share tiếp nhé <3')
			$('#Share button').prop('disabled', false);
        };
    };

    o.share = function(){
        if(data.gid.length){
            api.share(data.token[0], data.gid[0].gid, data.sid, data.message, function(a){
                if(a){
					log('<font color="red">Group thứ :'+ data.gid.length + '</font><font color="green">|Thành Công Group:' + a.id.split('_')[1]); 
                    data.live++;
                }else{
					log('<font color="red">Group thứ :'+ data.gid.length + '</font></font><font color="green">|Thất bại Group:</font> <font color="red">Xảy ra lỗi rồi , kiểm tra token hoặc post share nhé .</font>');
                }
				setTimeout(function(){
					data.gid.splice(0, 1);
					if(data.gid.length){
						run.share();
                        run.cmtpost();
					} else {
						data.token.splice(0, 1);
						if (_share != data.token[0]) {
							if(data.token.length){
								_share = data.token[0];
								run.get();
							}
						}
					}
				}, data.delay * 1000);
            });
        }else{
            
        };
    };

    o.getStt = function(){
      
        if(index < data.token.length){
            api.getstatus(data.token[index], function(a){
                if(a){
                    data.sid = a;
                    run.cmt();
                }else{
                    run.getStt();
                };
            });
        }else{
            log('HoĂ n thĂ nh comments: '+ data.live);
            index = 0;
            _run = false;
        };
    };

    o.cmtpost =  function () {
        console.log("die",data);
        // return true;
        api.commentPost(data.token[index], data.sid[0].id,data.comment, function(a){
            // if(a){
            //     data.live++;
            //     log('Live: '+ data.sid[0].id);
            // }else{
            //     log('Error: '+ data.sid[0].id +' -- Fail');
            // };
        });
    }

    o.cmt = function(){
        if(data.sid.length){
            if(data.limit && index !== 0){
                if(!(index % data.limit)){
                    data.notes.splice(0, 1);
                };
            };
            console.log("comment",data);
            api.comment(data.token[index], data.sid[0].id, data.notes[0], function(a){
                if(a){
                    data.live++;
                    log('Live: '+ data.sid[0].id);
                }else{
                    log('Error: '+ data.sid[0].id +' -- Fail');
                };
                data.sid.splice(0, 1);
                run.cmt();
            });
        }else{
            index++;
            run.getStt();
        };
    };
}(run));

function log(text){
    $('#log .panel-body').prepend('<span> '+ text +' </span>');
};
function pausecomp(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
} 