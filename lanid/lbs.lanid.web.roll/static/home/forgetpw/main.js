/**
 * Created by lbs005 on 7/10/15.
 */


console.log('reset passwort is loaded...');

lbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};
lbs.routes['/details:nomenu'] = {mod: 'lbs.details:nomenu', location: '/details/main.js'};
lbs.routes['/workspace/login'] = {mod: 'lbs.workspacelogin', location: '/workspace/main.js'};
lbs.routes['/home/forgetpw/resetpassword'] = {mod: 'lbs.home:resetpassword', location: '/home/forgetpw/main.js'};



lbs.modules['/home/forgetpw/resetpassword'] = {
    container : '#main_container'
    ,parent:null
    ,mainView:'/home/forgetpw/resertPW.new.html'
    ,create:function(){
        var me = this;
        this.parent = lbs['details:nomenu'];
        lbs['home:resetpassword'] = this;

        //
        //lbs.modHelper.getMod('/workspace/login').then(function(loginMod){
        //
        //    me.handlers = loginMod.handlers;
        //
        //    console.log('got handlers----',me.handlers);
        //
        //
        //
        //});

        this.handlers['resertpw:reset:again'] = function(e){

            console.log('reset again');
           $('#resetPassWordPage').removeClass('hide');
            $('.setPasswordPageLogin').addClass('hide');
        }

        this.handlers['resertpw:done:login'] = function(e){
            me.login(e);
        }

        this.handlers['reset:password:get:verification:code'] = function(e){
            me.sendVerificationCode(e);
        }
        this.handlers['modal:recover:password:box'] = function(e){
            me.recoverPasswordFromModal(e);
        }

        this.handlers['modal:recover:verification:code'] = function(e){
            me.recoverPasswordVerificationCodeGiven(e);
        }

        this.handlers['modal:recover:new:password'] = function(e){
            me.recoverPasswordNewPasswordGiven(e);
        }

        this.handlers['recover:login:from:registration:box'] = function(e){
            me.loginFromRegistrationBox(e);
        }


        this.handlers['recover:register:info:provided'] = function(e){
            me.registrationInfoProvided(e);
        }




        delete this.deps;
        delete this.create;
    }
    ,basePath:'/details'
    ,deps:['/details:nomenu']
    ,render : function render(arg){
        var me = this;
        //
        //arg = arg || {};
        //arg.registration = true;
        return this.parent.render(arg)
            .then(function(){
                lbs.modHelper.getView(me.mainView)
                    .then(function(view){
                        lbs.modHelper.setContainer({
                            container:me.container
                            ,html:view
                        });

                        //  jQuery(me.container).addClass('gray_bg');
                        //$("#conformPassword").keyup(checkPasswordMatch);
                        //passWordStrengh();
                        //randomString();



                        lbs.actionHandler({
                            container:me.container
                            ,handlers:me.handlers
                        })

                    })
            })
    }


    ,login:function login(e){
        var me = this;
        e.preventDefault();
        console.log('loging in----');
        jQuery.post(
            lbs.basemodule.endPoints.login
            ,{
                password:document.getElementById('password').value
                ,username:document.getElementById('username').value
                //password:'123456'
                //,username:'leo'
                ,antiBotValue:'MSNP'
                ,user_captcha:'MSNP'
            }
        ).then(function resolve(e){
                console.log('after login from reset');
                if(e&&e.pl&&e.pl.status===true){

                    $.bbq.pushState('#/workspace/welcome');
                }
            },function reject(msg){
                msg = (msg && msg.status === 0)?'You are disconnected, please connect and try again':'Login failed, please try again.';//@todo: should come from lbs.settings.messages
                jQuery('.login-status').html(msg);//@todo: should
                console.log('reject after post');
            });
    }

    ,sendVerificationCode:function sendVerificationCode(e){
        var me = this;

        var phone = $('#modalResetPassWordPhone').val();


        if(phone){


            this.countDowndManager('.transactionCountDown','.getVerificationCodeBtn');

            lbs.modHelper.getMessage('/home/user/recover/verification/'+phone+'.json',false,null,'POST',{mobile:phone})
                .then(function(response){

                    if(response&&response.pl&&response.pl.status){

                        me.phone = phone;
                        console.log('mobile phonse save succesfully---',response);

                    }
                    else{
                        $('#modalResetPwIdNotMatching').text('此手机号未绑定');
                        $('#modalResetPwIdNotMatchingBox').removeClass('hide');
                    }

                })

        }
        else
        {

            $('#modalResetPwIdNotMatching').text('请输入手机号');
            $('#modalResetPwIdNotMatchingBox').removeClass('hide');

        }
    }
    ,recoverPasswordVerificationCodeGiven:function recoverPasswordVerificationCodeGiven(e){

        var me = this;

        console.log('change---');
        $('#modalResetPassWordNewPassword').prop('disabled','')
        $('#modalResetPassWordConfirmNewPassword').prop('disabled','')


    }

    ,countDowndManager: function countDowndManager(container,btn){

        $('.verificationCodeSentNote').removeClass('hide');
        $(container).removeClass('hide');


        if($('.transactionCountDown').parents('.getVerificationCodeBtn').hasClass('disabled')){

            console.log('disabled--');
            return;
        }

        $(btn).addClass('disabled');

        preventDisabledClick();//todo: seems not being used;

        var countDownForgetPw = setInterval(function(){


            var val = $(container).text();
            var intVal  = parseInt(val,10);
            if(intVal>0){
                $(container).text(intVal-1);
            }
            else{

                clearInterval(countDownForgetPw);
                $(btn).removeClass('disabled');
                $('.verificationCodeSentNote').addClass('hide');
                $(container).addClass('hide');
                $(container).text('60');


            }

        },1000);


    }

    ,recoverPasswordNewPasswordGiven:function recoverPasswordNewPasswordGiven(e){

        var me = this;

        var code = $('#modalResetPassWordVerificationCode').val();

        var newPw = $('#resetPassWordPage form').serializeObject();


        if(code){


            if(newPw.confirmNewPassword&&newPw.newPassword){


                if(newPw.confirmNewPassword === newPw.newPassword){


                    return  lbs.modHelper.getMessage('/home/user/recover/verification/code/'+code+'.json',null,null,'POST',{userInfo:me.phone,code:code,mobile:me.phone,newPassword:newPw.newPassword})
                        .then(function(response){

                            console.log('user found by mobile---',response);

                            if(response&&response.pl&&response.pl.status){


                                $('#resetPassWordPage').addClass('hide');
                                $('.setPasswordPageLogin').removeClass('hide');


                            }
                            else{

                                $('#modalResetPwIdNotMatching').text('验证码有误,请重试！');
                                $('#modalResetPwIdNotMatchingBox').removeClass('hide');

                            }

                        });


                }
                else{

                    console.log('password not matching--');

                    $('#modalResetPwIdNotMatching').text('密码不一致!');
                    $('#modalResetPwIdNotMatchingBox').removeClass('hide');

                }


            }
            else{
                $('#modalResetPwIdNotMatching').text('密码不能为空!');
                $('#modalResetPwIdNotMatchingBox').removeClass('hide');
            }

        }
        else{

            $('#modalResetPwIdNotMatching').text('请输入验证码');
            $('#modalResetPwIdNotMatchingBox').removeClass('hide');

        }


    }


    ,handlers:{
    }
};
