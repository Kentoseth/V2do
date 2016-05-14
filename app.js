$(function() {
    var i = Number(localStorage.getItem('todo-counter')) + 1,
        j = 0,
        k,
        $form = $('#todo-form'),
        $removeLink = $('#show-items li a'),
        $itemList = $('#show-items'),
        $editable = $('.editable'),
        $clearAll = $('#clear-all'),
        $newTodo = $('#todo'),
        order = [],
        orderList;
        
    function createTodoLi(index, item)
    {
        var value = localStorage.getItem(item);
    	  var todo = $("<a>").addClass("editable ui-btn")
        								   .text(value);
    	  var remove = $("<a>").attr("href", "#")
                             .addClass("ui-btn ui-btn-icon-notext ui-icon-delete ui-btn-a remove")
                             .text("Remove");
    	  var li = $("<li>").attr("id", item)
                          .addClass("ui-li-has-alt")
                          .append(todo)
                          .append(remove);
                          
        return li;
    }

    // Load todo list
    orderList = localStorage.getItem('todo-orders');
    
    orderList = orderList ? orderList.split(',') : [];
    
	  $.each(orderList, function (i, item) {
      	order.push(createTodoLi(i, item));
	  });
	  $itemList.append(order);
        
    // Add todo
    $form.submit(function(e) {
        e.preventDefault();
        $.publish('/add/', []);
    });

    // Remove todo
    $itemList.delegate('a.remove', 'click', function(e) {
        var $this = $(this);
        
        e.preventDefault();
        $.publish('/remove/', [$this]);
    });
    
    // Sort todo
    $itemList.sortable({
        revert: true,
        stop: function() {
            $.publish('/regenerate-list/', []);
        }
    });
    
     // Edit and save todo
    $editable.inlineEdit({
        save: function(e, data) {
                var $this = $(this);
                localStorage.setItem(
                    $this.parent().attr("id"), data.value
                );
            }
    }); 

    // Clear all
    $clearAll.click(function(e) {
        e.preventDefault();
        $.publish('/clear-all/', []);
    });
        
    // Subscribes
    $.subscribe('/add/', function() {
        if ($newTodo.val() !== "") {
            // Take the value of the input field and save it to localStorage
            localStorage.setItem( 
                "todo-" + i, $newTodo.val() 
            );
            
            // Set the to-do max counter so on page refresh it keeps going up instead of reset
            localStorage.setItem('todo-counter', i);
            
            // Append a new list item with the value of the new todo list
            $itemList.append(createTodoLi(i, "todo-" + i));

            $.publish('/regenerate-list/', []);

            // Hide the new list, then fade it in for effects
            $("#todo-" + i)
                .css('display', 'none')
                .fadeIn();
            
            // Empty the input field
            $newTodo.val("");
            
            i++;
        }
    });
    
    $.subscribe('/remove/', function($this) {
        var parentId = $this.parent().attr('id');
        
        // Remove todo list from localStorage based on the id of the clicked parent element
        localStorage.removeItem(
            "'" + parentId + "'"
        );
        
        // Fade out the list item then remove from DOM
        $this.parent().fadeOut(function() { 
            $this.parent().remove();
            
            $.publish('/regenerate-list/', []);
        });
    });
    
    $.subscribe('/regenerate-list/', function() {
        var $todoItemLi = $('#show-items li');
        // Empty the order array
        order.length = 0;
        
        // Go through the list item, grab the ID then push into the array
        $todoItemLi.each(function() {
            var id = $(this).attr('id');
            order.push(id);
        });
        
        // Convert the array into string and save to localStorage
        localStorage.setItem(
            'todo-orders', order.join(',')
        );
    });
    
    $.subscribe('/clear-all/', function() {
        var $todoListLi = $('#show-items li');
        
        order.length = 0;
        localStorage.clear();
        $todoListLi.remove();
    });
});