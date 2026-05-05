import {omk} from './omk.js';

export class auth {
    constructor(params) {
        var me = this;
        this.modal;
        this.m;
        this.navbar = params.navbar ? params.navbar : 'navbarMain';
        this.apiOmk = params.apiOmk ? params.apiOmk : false; 
        this.mail = params.mail ? params.mail : false;
        this.ident = params.ident ? params.ident : false;
        this.key = params.key ? params.key : false;
        this.omk = false;
        this.keyGitHub = params.keyGitHub ? params.keyGitHub : false;        
        this.octo = params.octo ? params.octo : false;        
        this.userAdmin=false;
        this.user=false;
                        
        this.init = function () {
            console.log('init');
        }
            
        this.getUser = async function (){

            //vérifie la connexion à OMK
            if(me.apiOmk) me.apiOmk += me.apiOmk.slice(-1)=='/' ? "" : "/";
            me.omk = new omk({'api':me.apiOmk,'key':me.key,'ident':me.ident,'mail':me.mail});
            let u = await me.omk.getUser();
            if(!u){
                me.user = false;
                me.omk = false;                                                                     
            }else {
                me.user = u;
                me.userAdmin = me.user["o:role"] == 'global_admin';            
                me.user.id=me.user['o:id'];
            }
            return me.user;
        }

        this.init();
    }
}
