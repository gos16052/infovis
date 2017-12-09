var lockColors = [
    "#FF0000",
    "#DD0000",
    "#BB0000",
    "#880000",
    "#660000"
];

var locks = Array();

function findLock(lock){
    return locks[indexOfLock(lock)];
}

function indexOfLock(lock){
    for(i=0; i<locks.length; i++){
        if(locks[i] == lock){
            return i;
        }
    }
    return -1;
}

function appendLock(lockName){
    var lock = { 
        name: lockName,
        color: lockColors[locks.length],
        acquire: Array(),
        usage: Array()
    } 
    locks.push(lock);
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

/*  append "lock" to "locks"
    @input
        name: function name
*/
function addLock(name){
    lock = getLockName(name);
    // check if the lock exists in locks
    var lockIndex = indexOfLock(lock)
    if(lockIndex == -1){
        appnedLock(lock);
        lockIndex = locks.length - 1;
    }
}


function clickLock(name){

}