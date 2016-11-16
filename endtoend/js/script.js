/**
 * ownCloud - endtoend
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Cengaverler <oguz.tanrikulu@metu.edu.tr>
 * @copyright Cengaverler 2016
 */

(function ($, OC) {

	$(document).ready(function () {
		$('#cryptoUpload').click(function () {
			$("#file").trigger("click");
		});

		$('#echo').click(function () {
			var url = OC.generateUrl('/apps/endtoend/login');
			var data = {
				username: "user",
				password: "user"
			};

			$.post(url, data).success(function (response) {
				$('#echo-result').text(response.success);
			});

		});
	});

})(jQuery, OC);