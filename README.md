
           ROS_KEY_AUTH
==============================

***************
MAIN GOAL/IDEA:
***************

Goal:
   * System developed with the goal of learning to develop with the Robot Operating System (ROS -http://www.ros.org/-)
   * Structure:
      - 'ros_tutorial':
           - It has a quick overview of ROS at
      - 'cli_key_auth':
           - The client component for the developed software
      - 'srv_key_auth':
           - The server component for the developed software
      - 'screens':
           - Some screens from the running software
           - The report of some issues found

Idea:
   * The client component is running in a Web Browser:
      - Asks to the user to type some text
      - While the user is typing this text, it tracks the keys being typed, and for each one the key down and key up time
      - Using these tracks build some features
      - Using 'roslibj's send these features to the server component
   * The server component is a Python ROS node:
      - It checks wheater the features sent by the client are corresponding to the user:
           - Sending an OK=True to the client if the features are corresponding, or otherwise an OK=False

**********
KEY FILES:
**********

Client side:

   * cli_key_auth -> client.html (the client interface)
   * cli_key_auth -> javascripts/client.js (the client code that accesses the ROS network using 'roslibjs' -http://robotwebtools.org/-)

Server side:

   * srv_key_auth -> src/key_auth/scripts/node.py (the code for the ROS node)
   * srv_key_auth -> src/key_auth/msg/Auth1Msg.msg (custom message used by the ROS node -'node.py'- and the client -'client.js'-)
   * srv_key_auth -> src/key_auth/msg/Auth2Msg.msg (custom message used by the ROS node -'node.py'- and the client -'client.js'-)
   * srv_key_auth -> src/key_auth/msg/Status.msg (custom message used by the ROS node -'node.py'- and the client -'client.js'-)


***************************
INSTALLATION/CONFIGURATION:
***************************

Client side:

   * If the Rosbridge Server is not running in the same machine that the client:
        - Open the terminal:
             - Go to '<your_path_here>/ros_key_auth/cli_key_auth/javascripts'
             - Edit the file 'client.js':
                  - It uses the variable ROSBRIDGE_SERVER in order to know where is running the Rosbridge Server:
                       - By default is configured for the local machine, change it to point the machine where is
                         running the Rosbridge Server

Server side:
   * Build:
        - Open a terminal:
             - Go to '<your_path_here>/ros_key_auth/srv_key_auth'
             - Build running the command 'catkin_make':
                  - As the ROS node is developed with Python, it is really generating the needed code for the custom messages:
                       - 'Auth1Msg', 'Auth2Msg' and 'Status'

********
RUNNING:
********

Server side:

   * It is needed to have ROS installed in the machine:
      - Follow the install instructions at: http://www.ros.org/install/
      - The current system was tested using ROS Indigo on Ubuntu 14.04.2/32 bits
   * Start the ROS master:
      - Open a terminal
           - Run 'roscore'
   * Start the Rosbridge Server:
      - If not installed, install it:
           - sudo apt-get install ros-indigo-rosbridge-suite
      - Starting the server:
          - Open a terminal
               - Source the 'setup.bash' file:
                    - 'source <your_path_here>/ros_key_auth/srv_key_auth/devel/setup.bash'
               - run 'roslaunch rosbridge_server rosbridge_websocket.launch'
   * Start the developed ROS node:
      - Open a terminal
           - Source the 'setup.bash' file:
                - 'source <your_path_here>/ros_key_auth/srv_key_auth/devel/setup.bash'
           - Run 'rosrun key_auth node.py'

Client side:

   * Start the client:
        - Go to '<your_path_here>/ros_key_auth'
        - Open with the browser the file 'client.html':
             - It was tested using Chrome 42.0.2311.90
        - Complete the text and send it to the started ROS node
