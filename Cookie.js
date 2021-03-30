const sso = new Map();
const ssoServer = new Map();
const haksa = new Map();
const cs = new Map();

module.exports.AddCookie = function(_domain, name, value) {
    var domain;
    switch(_domain){
        case 'sso':
            domain = sso;
            break;
        case 'ssoServer':
            domain = ssoServer;
            break;
        case 'haksa':
            domain = haksa;
            break;
        case 'cs':
            domain = cs;
            break;
    }

    domain.set(name, value);
};

module.exports.GetCookie = function(domain, name) {
    var domain;
    switch(_domain){
        case 'sso':
            domain = sso;
            break;
        case 'ssoServer':
            domain = ssoServer;
            break;
        case 'haksa':
            domain = haksa;
            break;
        case 'cs':
            domain = cs;
            break;
    }
    
    return domain.get(name);
};

module.exports.GetCookie = function(_domain) {
    var domain;
    switch(_domain){
        case 'sso':
            domain = sso;
            break;
        case 'ssoServer':
            domain = ssoServer;
            break;
        case 'haksa':
            domain = haksa;
            break;
        case 'cs':
            domain = cs;
            break;
    }
    

    var resCookie = '';
    for (const [key, value] of domain) {
        resCookie = resCookie + key + '=' + value + '; ';
    }
    return resCookie;
}

module.exports.DeleteCookie = function(_domain, name) {
    var domain;
    switch(_domain){
        case 'sso':
            domain = sso;
            break;
        case 'ssoServer':
            domain = ssoServer;
            break;
        case 'haksa':
            domain = haksa;
            break;
        case 'cs':
            domain = cs;
            break;
    }
    
    domain.delete(name);
};

module.exports.ClearCookie = function(_domain) {
    var domain;
    switch(_domain){
        case 'sso':
            domain = sso;
            break;
        case 'ssoServer':
            domain = ssoServer;
            break;
        case 'haksa':
            domain = haksa;
            break;
        case 'cs':
            domain = cs;
            break;
    }
    
    domain.clear();
};

module.exports.ClearCookieAll = function() {
    sso.clear();
    ssoServer.clear();
    haksa.clear();
    cs.clear();
}