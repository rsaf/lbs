/*
 * Routes a module so you can do:
 * lbs.modHelper.getMod('/uri')
 *   .then(function(theModule){...
 */
lbs.routes['/uri'] =  {
    mod: 'lbs.myMod', //no longer used since getMod returns the module
    /*
     * the location this module can be found in so getMod can load it
     * if it is not already loaded
     */
    location: '/workspace/main.js'
};

lbs.modules['/uri'] = {
    /*
     * Not needed but if you want to bind it is better to clean it up when your
     * module is replaced by another
     */
    boundValue:[],
    /*
     * This will be called once when the module is created
     */
    create:function(){
        /*
         * For this to render workspace has to create DOM in the html body
         *   so this module has a parent that will be in the deps
         *   when create is called then /workspace is loaded as well
         *   since it is a dependency of this module.
         *   Workspace will render the header, footer and menu and this can
         *   render in a <div> provided by workspace
         */
        this.parent = lbs.workspace;
        var me = this;
        /*
         * After render renders it usually set actionhandlers passing me/this.handlers
         * as the object containing the handlers lbs.actionHandler is defined in utils.js
         */
        me.handlers.saveSomething = function(e){
            me.saveSomething(e);
        }
        /*
         * No longer used but here the mod can register itself so it can be refered
         * to as lbs.myMod but you may as well use lbs.getMod since it will not load
         * again after the first time
         */
        lbs.myMod = this;
        /*
         * Delete deps and create so the getMod knows it does not have to fetch
         * dependencies or call create when this module is requested
         */
        delete this.deps;
        delete this.create;
    }
    /*
     * When module is loaded first time the getMod funciton will check these
     * values and try to load the modules specified here. Be careful not to
     * create circular dependencies.
     */
    ,deps:['/workspace']
    /*
     * Because this module has a container property the router will call render
     * for modules not rendered by router the container should not be set as
     * this is usually passed to the module by another module (modules like
     * popups and lists)
     */
    ,container:'#right_container'
    /*
     * render should always return a promise but does not need to return a
     * value when the promise is resolved
     * Some modules re use /global:photos:list to take care of repeating tasks
     * this module is defined in util.js and has a render and rerender function
     */
    ,render : function render(arg){
        var me = this;
        /*
         * Since this module needs a parent to render it's container we have to
         * call parent render, while doing this we also fetch the view used
         * for this module
         */
        jQuery.when(
            lbs.modHelper.getView('/workspace/someT3mplate.html'),
            this.parent.render(arg)
        )
            .then(function(view){
                /*
                 * To get data we can use getMessage, a data store is not yet implemented
                 * that the getMessage can get it's data from so this will make a request
                 * every time unless you set cache explicedly to true (no truthy value but true)
                 */
                return lbs.modHelper.getMessage (
                    '/workspace/someData.json',//location
                    'still will not cache',//cache: will only cache if this === true
                    /*
                     * next argument is recover options, any object will do. if the
                     * request fails it will try to recover and then try again
                     * this is why fetching data is not in a jQuery.when
                     */
                    {},
                    'GET',//httpType: defaults to GET but can be POST, PUT or DELETE as well
                    /*
                     * Next variable is data to POST, GET,PUT or DELETE for anything but GET
                     * I prefer to send only one value (for example json) with a json string
                     * and have the server JSON.parse it to be sure it is type save: for example:
                     * {
                     *   json: JSON.stringify(
                     *     {
                     *       delete:true,
                     *       hasSomthing:true,
                     *       entity:someEntity
                     *     }
                     *   )
                     * }
                     */
                    {domeID:22}
                );

                /*
                 * Using setContainer to set the html registers this module to be
                 * rendered in '#right_container' when another module wants to render
                 * in '#right_container' then the remove of this module is called
                 */
                lbs.modHelper.setContainer(
                    {
                        mod:me,html:Mustache.render(
                        view,
                        {settings:{showButton:true}}
                    ),
                        container:me.container
                    }
                );
                me.boundValues = lbs.binder.bind(me.container,someEntity,'nameSpace');
                /*
                 * Will set the bound values with the values of someEntity. If template
                 * has an input with data-bind = 'nameSpace.someValue' then it's value
                 * will be set with someValue
                 * There is a complex bound value named PhotoUploadBoundValue that will
                 * set an image and enable you to choose a photo from the platform or
                 * upload one.
                 */
                lbs.binder.updateUI(me.boundValues);
                d.resolve();
            });
        return d.promise();
    }
    /*
     * handlers is usually an empty object that is is set in the module.create method
     */
    ,handlers:{}
    ,remove:function(args){
        /*
         * Clean up code, I usually not unbind action handlers and think
         * jQuery takes care of it but will clean up any bound values
         */
        lbs.binder.unbind(me.boundValues);
    }
};