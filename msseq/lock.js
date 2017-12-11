var lockColors = [
    "#FF0000",
    // "#EE0000",
    "#DD0000",
    // "#CC0000",
    "#BB0000",
    // "#AA0000",
    "#880000",
    // "#770000",
    "#660000",
    // "#550000",
    "#440000",
];

var _locks = Array();

function getLocks(){
    return _locks;
}
function findLock(lock){
    return _locks[indexOfLock(lock)];
}

function indexOfLock(lockName){
    for(i=0; i<_locks.length; i++){ 
        if(_locks[i].name == lockName){
            return i;
        }
    }
    return -1;
}

function getLock(lockName){
    return _locks[indexOfLock(lockName)]
}

function appendLock(fname, node){
    var lockName = getLockName(fname);
    var index = indexOfLock(lockName);
    
    if(index == -1){
        var lock = { 
            name: lockName,
            color: lockColors[_locks.length],
            acquire: [node]
        } 
        _locks.push(lock);
        return lock;
    }
    _locks[index].acquire.push(node);
    return _locks[index];
}

/*  return lock name in the function name
    @input
        name: function name
    @output
        lock name
*/
function getLockName(name){
    if(!isLock(name)) return undefined;
    // get the name of the lock
    var startIndex = name.indexOf("_") + 1 ;
    var endIndex = name.indexOf("_", startIndex);
    return name.substring(startIndex, endIndex);
}

/*  check if the function is about lock
    @input
        name: function name
    @output
        whether the function is about lock
*/
function isLock(name){
    if(name.indexOf("lock") == 0){
        return true;
    }
    return false;
}


/*  append "lock" to "_locks"
    @input
        name: function name
*/
function addLock(name){
    lock = getLockName(name);
    // check if the lock exists in _locks
    var lockIndex = indexOfLock(lock)
    if(lockIndex == -1){
        appnedLock(lock);
        lockIndex = _locks.length - 1;
    }
}


function clickLock(name){

}