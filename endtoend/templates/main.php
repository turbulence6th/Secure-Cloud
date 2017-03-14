<?php
script('endtoend', 'bootstrap');
script('endtoend', 'bootstrap-treeview');
script('endtoend', 'jsgrid.min');
script('endtoend', 'script');

style('endtoend', 'bootstrap');
style('endtoend', 'bootstrap-treeview');
style('endtoend', 'jsgrid.min');
style('endtoend', 'jsgrid-theme.min');
style('endtoend', 'font-awesome.min');
style('endtoend', 'style');

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
