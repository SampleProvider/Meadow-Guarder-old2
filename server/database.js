var USE_DB = true;

const {Client} = require('pg');

if(SERVER === 'localhost'){
	require("./DATABASE_URL.js");
}
else{
	connectionString = connectionString = process.env.DATABASE_URL;
}

const client = new Client({
	connectionString:connectionString,
	ssl:{
		rejectUnauthorized: false
	}
});

client.connect();

storeDatabase = function(players){
    if(!USE_DB){
		return;
	}
	for(var i in players){
		client.query('UPDATE progress SET username=\'' + players[i].username + '\', progress=\'' + JSON.stringify({items:players[i].inventory.items,xp:players[i].xp,level:players[i].level,img:players[i].img,advancements:players[i].advancements,version:VERSION}) + '\' WHERE username=\'' + players[i].username + '\';', (err, res) => {
			if(err){
				throw err;
			}
		});
	}
}
getDatabase = function(username,cb){
    if(!USE_DB){
		return cb({});
	}
	client.query('SELECT * FROM progress WHERE username=\'' + username + '\';', (err, res) => {
		if(res.rows[0]){
			return cb(JSON.parse(res.rows[0].progress));
		}
		else{
			return cb({});
		}
	});
}
getLeaderboard = function(cb){
    if(!USE_DB){
		return cb([]);
	}
	client.query('SELECT * FROM progress;', (err, res) => {
		if(res.rows[0]){
			var leaderboard = [];
			for(var i in res.rows){
				var progress = JSON.parse(res.rows[i].progress);
				if(progress.xp !== undefined && progress.level !== undefined){
					leaderboard.push({
						name:res.rows[i].username,
						xp:progress.xp,
						level:progress.level,
					});
				}
			}
			var compare = function(a,b){
				if(a.level > b.level){
					return -1;
				}
				else if(b.level > a.level){
					return 1;
				}
				else{
					if(a.xp > b.xp){
						return -1;
					}
					else if(b.xp > a.xp){
						return 1;
					}
					return 0;
				}
			}
			leaderboard.sort(compare);
			return cb(leaderboard);
		}
		else{
			return cb([]);
		}
	});
}

Database = {};

Database.isValidPassword = function(data,cb){
    if(!USE_DB){
		return cb(3);
	}
	client.query('SELECT * FROM account WHERE username=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		if(res.rows[0]){
			var row = JSON.parse(JSON.stringify(res.rows[0]));
			if(row.password === data.password){
				for(var i in Player.list){
					if(Player.list[i].username === data.username){
						return cb(2);
					}
				}
				return cb(3);
			}
			else{
				return cb(1);
			}
		}
		else{
			return cb(0);
		}
	});
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB){
		return;
	}
	client.query('SELECT * FROM account WHERE username=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		if(res.rows[0]){
			return cb(0);
		}
		else{
			return cb(1);
		}
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	client.query('INSERT INTO account(username, password) VALUES (\'' + data.username + '\', \'' + data.password + '\');', (err, res) => {
		if(err){
			throw err;
		}
		client.query('INSERT INTO progress(username, progress) VALUES (\'' + data.username + '\', \'{}\');', (err, res) => {
			if(err){
				throw err;
			}
			return cb();
		});
	});
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
		return cb();
	client.query('DELETE FROM account WHERE username=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		client.query('DELETE FROM progress WHERE username=\'' + data.username + '\';', (err, res) => {
			if(err){
				throw err;
			}
			return cb();
		});
	});
}
Database.changePassword = function(data,cb){
    if(!USE_DB)
		return cb();
	client.query('UPDATE account SET password=\'' + data.newPassword + '\'WHERE username=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		return cb();
	});
}