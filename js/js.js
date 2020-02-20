var budgetcontroller = (function(){
    var ID = 0;
    var Expense = function(id, descript, value)
    {
        this.id = id;
        this.descript = descript;
        this.value = value;
        this.prcentage = -1;
    }
    
    Expense.prototype.calcprcentage = function(allincome){
        if(allincome > 0) this.prcentage = Math.round((this.value / allincome) * 100);
        else this.prcentage = -1;
    };
    
    Expense.prototype.getprcentage = function(){
        return this.prcentage;  
    };
    
    var Income = function(id, descript, value)
    {
        this.id = id;
        this.descript = descript;
        this.value = value;
    }
    
    var total_inc_exp = function(type){
        var sum = 0;
        
        data.allitems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.total[type] = sum;
    }
    
    var data = {
        allitems : {
            inc: [],
            exp: [],
        },
        total: {
            inc: 0,
            exp: 0,
        },
        
        budgut: 0,
        
        presntage: -1
    };
    
    return {
        additem: function(typ, des, val)
        {
            var Id, newitem;
            
            // set id
            Id = ID;
            ID++;
            // add item
            if(typ === "inc"){
                newitem = new Income(Id, des, val);
            }else if(typ === "exp"){
                newitem = new Expense(Id, des, val);
            }
            data.allitems[typ].push(newitem);
            return newitem;
        },
        
        calcbudgut: function(){
            // calc total inc && exp
            total_inc_exp("inc");
            total_inc_exp("exp");
            
            // calc budgut
            data.budgut = data.total.inc - data.total.exp;
            
            // calc prentage
            if(data.total.inc > 0 && data.total.inc >= data.total.exp){
                data.presntage = Math.round((data.total.exp / data.total.inc) * 100);
            }else{
                data.presntage = -1;
            }
        },
        
        getbudgut: function(){
            return {
                budgut: data.budgut,
                total_inc: data.total.inc,
                total_exp: data.total.exp,
                presntage: data.presntage
            };
        },
        
        removeitem: function(type, id)
        {
            var index, ids;
            //get array of ids
            ids = data.allitems[type].map(function(cur){
                return cur.id;
            });
            // get index
            index = ids.indexOf(id);
            
            //remove the item if not index equall -1 (not found the id in ids)
            if(index !== -1){
                data.allitems[type].splice(index, 1);
            }
            
        },
        
        calcprcentage: function(){
            data.allitems.exp.forEach(function(cur){
                cur.calcprcentage(data.total.inc); 
            });  
        },
        
        getprcentage: function()
        {
            var allp = data.allitems.exp.map(function(cur){
                return cur.prcentage;
            });
            
            return allp;
        },
        
        test:function(){
            return data;
        }
    }
    
})();

var uicontroller = (function(){
    // get all dom we need to
    var Domstring = {
        inputtype: '.add_type',
        inputdescription: 'add_description',
        inputnumber: 'add_number',
        btn: '.getdata',
        income_list: 'income_section',
        expense_list: 'expenses_section',
        allbudgutlabel: 'allbudgety',
        incomelabel: 'income',
        expenseslabel: 'expenses',
        presntagelabel: 'present_from_budgety',
        btn_remove: '#remove',
        containers: '.containers',
        peslabel : '#pes',
        month: '.detalis_in__month'
    };
    
    var formattingnumber = function(num, type){
        var numsplice, dec, number;
        /*
        23452.3421 -> 23,452.34
        */

        num = Math.abs(num);
        num = num.toFixed(2);
        numsplice = num.split('.');
        
        number = numsplice[0];
        
        dec = numsplice[1];
        
        if(number.length > 3){
            num = number.substring(0, number.length - 3) + ',' + number.substring(number.length - 3, );
            number = num;
        }
        
        return (type === 'inc'? '+ ' : '- ') + number + '.' + dec;
    }
    
    return {
        // get input from ui
        inputs : function(){
          return {
              inputtype: document.querySelector(Domstring.inputtype).value,
              inputdescript: document.getElementById(Domstring.inputdescription).value,
              inputnum: parseFloat(document.getElementById(Domstring.inputnumber).value),
          };
        },
        // return Doms for used it in controller
        Doms: function(){
            return Domstring;
        },
        
        // add new item in ui
        additem: function(obj, type)
        {
            var html, newhtml, element;
            
            // create html
            if(type === 'inc'){
                element = Domstring.income_list;
                html = '<div id="%Id%" class="values"><span class=name>%descript%</span><button class="remove" id=remove>x</button><span class="salary forin">%value%</span></div>';
            }else if(type === 'exp'){
                element = Domstring.expense_list;
                html = '<div id="%Id%" class="values"><span class=name>%descript%</span><button class="remove" id=remove>x</button><span id=pes class="pse">23%</span><span class="salary forex">%value%</span></div>';
            }
            
            // repleace values
            newhtml = html.replace("%Id%", obj.id);
            newhtml = newhtml.replace("%descript%", obj.descript);
            newhtml = newhtml.replace("%value%", formattingnumber(obj.value, type));
            
            // modfit Dom
            document.getElementById(element).insertAdjacentHTML('beforeend', newhtml);
        },
        
        clearfields: function(){
            
            document.getElementById(Domstring.inputdescription).value = '';
            document.getElementById(Domstring.inputdescription).focus();
            document.getElementById(Domstring.inputnumber).value = '';
        },
        
        displaybudgut: function(obj)
        {
            var type;
            obj.budgut > 0 ? type = 'inc' : type = 'exp';
            
            document.getElementById(Domstring.allbudgutlabel).textContent = formattingnumber(obj.budgut, type);
            document.getElementById(Domstring.incomelabel).textContent = formattingnumber(obj.total_inc, 'inc');
            document.getElementById(Domstring.expenseslabel).textContent = formattingnumber(obj.total_exp, 'exp');
            if(obj.presntage > 0) document.getElementById(Domstring.presntagelabel).textContent = obj.presntage + '%';
            else document.getElementById(Domstring.presntagelabel).textContent = '---';
        },
        
        removeitem: function(id, type){
            document.getElementById(id).parentNode.removeChild(document.getElementById(id));
            
        },
        
        displaypre: function(allp){
            var alllabel = document.querySelectorAll(Domstring.peslabel);
            
            for(var i = 0; i < alllabel.length; i++){
                if(allp[i] != -1)alllabel[i].textContent = allp[i] + '%';
                else alllabel[i].textContent = '---';
            }
        },
        
        changetype: function(){
            
            document.querySelector(Domstring.inputtype).classList.toggle('changecolor');
            document.getElementById(Domstring.inputnumber).classList.toggle('changecolor');
            document.getElementById(Domstring.inputdescription).classList.toggle('changecolor');
            document.querySelector(Domstring.btn).classList.toggle('red');
        },
        
        setCurMonth: function(){
            var date, month;
            date = new Date();
            month = date.toDateString().split(' ')[1];
            document.querySelector(Domstring.month).textContent = month;
        }
    };
    
})();

var controller = (function(budgetcrtl, uicrtl){
    var Domstring, inputs;
    // start app
    function start()
    {
        Domstring = uicrtl.Doms();
        document.querySelector(Domstring.btn).addEventListener("click", addnewitem);
    
        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which == 13) addnewitem();
        });
        
        document.querySelector(Domstring.containers).addEventListener("click", function(event){
            deleteitem(event);  
        });

        document.querySelector(Domstring.inputtype).addEventListener("change", uicrtl.changetype);
       
    }
    
    // remove item
    var deleteitem = function(event){
        
        if(event.target.id === 'remove'){
            var type, id;
            
            // get id && type
            id = event.target.parentNode.id;
            if(event.target.parentNode.parentNode.id === "income_section") type = 'inc';
            else if(event.target.parentNode.parentNode.id === "expenses_section") type = 'exp';
            id = parseInt(id);
            // delete item from budgut controller
            budgetcrtl.removeitem(type, id);

            //delete from   ui
            uicrtl.removeitem(id, type);

            //update ui
            updateui();
        }
        
    };
    
    //update ui each add or delete item
    var updateui = function(){
        var budget;
        
        // calc budgut and total inc && exp && precntage
        budgetcrtl.calcbudgut();
        
        //get budgut
        budget = budgetcrtl.getbudgut();
        
        //update ui
        uicrtl.displaybudgut(budget);
    }
    
    //update prenstage
    var updatepresntage = function()
    {
        var allp;
        // calc presntage
        budgetcrtl.calcprcentage();
        
        //get prcentage from budgut ctrl
        allp = budgetcrtl.getprcentage();

        // update ui with new prenstage
        uicrtl.displaypre(allp);
    }
    
    // add new item
    function addnewitem()
    {
        // get inputs
        inputs = uicrtl.inputs();
        
        if(!isNaN(inputs.inputnum) && inputs.inputnum > 0 && inputs.inputdescript.trim() != ""){
            // add in budgutcontroller
            var items = budgetcrtl.additem(inputs.inputtype, inputs.inputdescript, inputs.inputnum);

            // add newitem in ui
            uicrtl.additem(items, inputs.inputtype);

            // clear fields
            uicrtl.clearfields();
            
            //update ui
            updateui();
            
            //update presntage
            updatepresntage();
            
        }
        
    }
    
    
    
    return {
        init: function()
        {
            console.log('app is start');
            start();
            uicrtl.displaybudgut({
                budgut: 0,
                total_inc: 0,
                total_exp: 0,
                presntage: 0
            });
            uicrtl.setCurMonth();
        }
    };
    
})(budgetcontroller, uicontroller);




controller.init();















