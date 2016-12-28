<?php
script('endtoend', 'bootstrap');
script('endtoend', 'bootstrap-treeview');
script('endtoend', 'angular');
script('endtoend', 'script');

script('endtoend', 'angular-tree-widget.min');
script('endtoend', 'angular-animate.min');
script('endtoend', 'angular-recursion');
script('endtoend', 'controller');
style('endtoend', 'bootstrap');
style('endtoend', 'bootstrap-treeview');
style('endtoend', 'style');
style('endtoend', 'angular-tree-widget.min');
?>

<div id="app">
	<div id="app-navigation">
		<?php print_unescaped($this->inc('part.navigation')); ?>
		<?php print_unescaped($this->inc('part.settings')); ?>
	</div>

	<div id="app-content">
		<div id="app-content-wrapper">
			<?php print_unescaped($this->inc('part.content')); ?>
		</div>
	</div>
</div>
