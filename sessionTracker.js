var sessions = {};

var createSession = function(id) {
  sessions[id] = {
    commands: []
  };
};

var displaySession = function displaySession(id) {
  return sessions[hcid].commands;
};
var hcid;
var handle = function handleMessage(id, command) {
hcid = id;
  sessions[id].commands.push({
    command: command,
    time: Date.now()
  });
};


exports.createSession = createSession;
exports.displaySession = displaySession;
exports.handle = handle;
