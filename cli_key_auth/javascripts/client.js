
/**

   'client.js'
 
   Copyright (C) 2015 Jorge Couchet <jorge.couchet at gmail.com>

   This file is part of 'ros_key_auth'
 
   'ros_key_auth' is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
 
   'ros_key_auth' is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
 
   You should have received a copy of the GNU General Public License
   along with 'ros_key_auth'.  If not, see <http ://www.gnu.org/licenses/>.

**/


// Protect the '$' sign against a clash in the global environment
(function($) {

	var   ros
            , ROSBRIDGE_SERVER = "ws://localhost:9090"
            , topic_pub
            , msg_topic
            , is_processing = false
            , show_close = true
            , times_failed = 0

            , mail = ""
	    , mail_akl
            , mail_d = []
            , mail_u = []

	    , txt1_akl
            , txt1_d = []
            , txt1_u = []

            , txt2_akl
            , txt2_d = []
            , txt2_u = []

	      // Calculate the average key latency for a
	      // given sequence of keyDown (in "down) and
              // keyUp (in "up)
            , calculate_avg_key_latency = function(down,up) {

		var   res = 0
		    , amnt = 0
                    , idx
                    , flag;

		for (var i = 0; i < down.length; i++) {

			flag = false;

			// For the current keyDown search for
			// the corresponding keyUp
                        for (var j = 0; j < up.length; j++) {

				if (up[j].key == down[i].key) {

					idx = j;

					flag = true;

					break;
				}
			}

			if (flag) {

				// Key latency = time_keyUp - time_keyDown
				res = res + (up[idx].ts  - down[i].ts);

				amnt++;

				// Remove the processed key
				up.splice(idx,1);
			}
		}

		if (amnt != 0) {
			
			// Calculate the average latency
			res = res/amnt;
		}

		return res;

              };



	// The code in the callback will be executed when the DOM is ready
        // It is a shorcut for: jQuery(document).ready(function() {});
	$(function() {

		// ******************************************************************
		// The code needed to manage the connection with the ROSBRIDGE SERVER
		// ******************************************************************

		ros = new ROSLIB.Ros();


		// There is a problem connecting to the ROSBRIDGE SERVER
		ros.on('error', function(error) {

			// If there is problem connecting to the ROSBRIDGE SERVER,
			// then show a modal warning the user about the problem
			$('#err_modal').modal({"show": true});

			// When there is an error is also fired the "close" event.
			// The flag is used to avoid showing the error and close
			// modals together
			show_close = false;
  		});


		// All is OK and the connection to the ROSBRIDGE SERVER was made
		ros.on('connection', function() {

			// Enable the email input in order to start to get the
			// needed keys in order to measure the keyword dynamics 
			// from the user
			$('#email1').attr("disabled", false);
			$('#btn0').attr("disabled", false);
			$('#email1').focus();
  		});

		// The connection to the ROSBRIGE SERVER was closed	
		ros.on('close', function() {

			if (show_close) {

				// The connection was closed while the server was processing,
				// then it is needed to close the modal that is saying the
				// user that the server is processing the authentication
				if(is_processing) {

					$('#publishing_modal').modal("hide");
				}

				// If the connection to the ROSBRIDGE SERVER was closed,
                        	// then show a modal warning the user about it
                        	$('#close_modal').modal({"show": true});

				// Disable inputs from the user
                                $('#email1').attr("disabled", true);
                                $('#btn0').attr("disabled", true);
				$('#txta1').attr("disabled", true);
                        	$('#btn1').attr("disabled", true);
				$('#txta2').attr("disabled", true);
                                $('#btn2').attr("disabled", true);
			}
  		});
		

		// Connecting to the ROSBRIGE SERVER
		ros.connect(ROSBRIDGE_SERVER);



		// ****************************************************************
		// The code needed to process the results from the ROSBRIDGE SERVER
		// ****************************************************************

  		// Suscribing to the topic that has the authentication result
  		topic_pub = new ROSLIB.Topic({
    			ros : ros,
    			name : '/key_auth_stat',
    			messageType : 'key_auth/Status'
  		});

  		// Adding the callback to be called when receiving a message from 
		// the authentication result topic
  		topic_pub.subscribe(function(message) {

			is_processing = false;

			$('#publishing_modal').modal("hide");

			if(message.ok) {

				show_close = false;

				// All is OK, the user is able to control the robot
				$('#ok_modal').modal({ "show": true, "backdrop": "static" });

				// Unsubscribe from the topic because is not needed anymore
                                topic_pub.unsubscribe();

				// Disconnect from the ROSBRIDGE SERVER
				ros.close();


			} else {		

				times_failed++;

				if (times_failed < 3) {

					// Clear the previous typed text
					$('#f0').trigger("reset");
					$('#f1').trigger("reset");
					$('#f2').trigger("reset");

					// Enable the first text area in order to get the
                                        // keyword dynamics from the user
                                        $('#email1').attr("disabled", false);
                                        $('#btn0').attr("disabled", false);

					// The authentiction failed
					$('#nok_modal').modal({"show": true});

				} else {

					show_close = false;

					// Disable the trials
                                        $('#disable_modal').modal({ "show": true, "backdrop": "static" });

					 // Unsubscribe from the topic because is not needed anymore
                                	topic_pub.unsubscribe();

					// Disconnect from the ROSBRIDGE SERVER
                                	ros.close();
				}	
			}
  		});



		// *******************************************************************
		// The needed callbacks in order to track the written keys by the user
		// *******************************************************************

		$('#email1').keydown(function(event) {

			// "event.timeStamp" has the time when the key was pressed down
                        // "event.which" has the code of the key pressed
			mail_d.push({"ts": event.timeStamp, "key": event.which});
                });


                $('#email1').keyup(function(event) {

			// "event.timeStamp" has the time when the key was released
                        // "event.which" has the code of the key pressed
                        mail_u.push({"ts": event.timeStamp, "key": event.which}); 
                });


		$('#txta1').keydown(function(event) {

                        txt1_d.push({"ts": event.timeStamp, "key": event.which});
                });
	

		$('#txta1').keyup(function(event) {

			txt1_u.push({"ts": event.timeStamp, "key": event.which});
		});

		$('#txta2').keydown(function(event) {

                        txt2_d.push({"ts": event.timeStamp, "key": event.which});
                });


                $('#txta2').keyup(function(event) {

                        txt2_u.push({"ts": event.timeStamp, "key": event.which});
                });



		// *******************************************************************
                //                       Auxiliar callbacks
                // *******************************************************************

		// It helps to focus the cursor in the field that the user should go
		// after failing the authentication process
		$('#nok_modal').on('hidden.bs.modal', function () {
  		
			$('#email1').focus();
		})



		// *******************************************************************
		// The needed callbacks in order to process the user keyboard dynamics
		// *******************************************************************

		// When the email was completed by the user
                $( "#f0" ).submit(function( event ) {

			// Get the email address (it is the user identifier)
			mail = $('#email1').val();

                        // Disable the email input
                        $('#email1').attr("disabled", true);
                        $('#btn0').attr("disabled", true);

                        // Enable the first text area in order to get the
                        // keyword dynamics from the user
                        $('#txta1').attr("disabled", false);
                        $('#btn1').attr("disabled", false);
                        $('#txta1').focus();

                        event.preventDefault();
                });

		// When the first the text area is completed by the user
		$( "#f1" ).submit(function( event ) {

			// Disable the first text area
                        $('#txta1').attr("disabled", true);
                        $('#btn1').attr("disabled", true);

			// Enable the second text area in order to get the
                        // keyword dynamics from the user
                        $('#txta2').attr("disabled", false);
                        $('#btn2').attr("disabled", false);
			$('#txta2').focus();

  			event.preventDefault();
		});

		// When the second the text area is completed by the user
                $( "#f2" ).submit(function( event ) {

			var msg;     

                   	// Disable the second text area
                        $('#txta2').attr("disabled", true);
                        $('#btn2').attr("disabled", true);

			// Show the user a message that the server is processing her/his authentication
			$('#publishing_modal').modal({ "show": true, "backdrop": "static" });

			is_processing = true;

			// Calculate the average key latence for the key in the mail string
			mail_akl = calculate_avg_key_latency(mail_d, mail_u);
			mail_d = [];
			mail_u = [];
                        

			// Calculate the average key latence for the key in the textarea "txta1"
			txt1_akl = calculate_avg_key_latency(txt1_d, txt1_u);
			txt1_d = [];
			txt1_u = [];

			// Calculate the average key latence for the key in the textarea "txta2"
                        txt2_akl = calculate_avg_key_latency(txt2_d, txt2_u);
			txt2_d = [];
			txt2_u = [];

			// We are creating a Topic object with details of the topic's name and message type.
  			msg_topic = new ROSLIB.Topic({
    				ros : ros,
    				name : '/key_auth_keydyn',
    				messageType : 'key_auth/Auth2Msg'
  			});

			// We are creating the payload to be published
			msg = new ROSLIB.Message({

				  // The user identifier
    				  "mail": mail

				  // The user keyboard dynamics
                                , "akls": [mail_akl, txt1_akl, txt2_akl]

				  // Test field in order to test complex messages
				, "test": [{'test1': false, 'test2': 'false'}, {'test1': true, 'test2': 'true'}]
  			});

			mail = "";

			// We are publishing the keyboard dynamics from the user
  			msg_topic.publish(msg);

                        event.preventDefault();
                });

	});

})(jQuery);
