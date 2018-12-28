---
title: 'OpenGL Development on WSL: From Setting Up to Giving Up (And What I Learned)'
date: 2018-04-15 17:53:33
categories:
- blog
---
One of my goals in the foreseeable future is to really delve into the world of 3D programming. After getting a taste of the basics of 3D in Blender and Unity, it seems like the logical next step is to learn to program using a graphics API in order to understand what those software truly abstracts away form us.<!-- more -->

To me (and probably anyone who's also looking to get into graphics), here's a great source of motivation:
> Computer graphics is one of the most bad ass, algorithmically and mathematically challenging fields you can do in Computer Science.
>                            --- /u/vansterdam_city on r/cscareerquestions

Naturally, I began to look at OpenGL, with its advantages being multi-platform and well-documented. Compared to WebGL which uses JavaScript (which I use a lot more often), OpenGL can provide me a good opportunity to refresh C/C++ ~~and headaches associated with them~~, which I sadly left behind for a while now.

So I stumbled across this well-received OpenGL tutorial https://learnopengl.com/, but since the author is using a Windows environment, it requires the use of Visual Studio, which I was stubbornly against since I was always used to programming C/C++ in a text editor and Linux environment.

You must think, "Just develop in Linux then". As much as I hate to admit it, I am a full time Windows user outside of work. Ever since the release of Windows Subsystem for Linux (WSL), I have transitioned all of my school and personal development over to this nifty tool, and it handled all of my uses (ssh, git, npm etc.) perfectly, while saving the hassle of dual-booting or VMs. Feeling adventurous, I decided to branch off from the tutorial and setup OpenGL development in WSL.

## Steps I took
Frist, I created a folder containing the OpenGL project, with subfolders /build, /source, and /libraries. An essential library I needed was [GLFW](http://www.glfw.org/). GLFW is a OpenGL utility library that provides a simple API for creating windows, contexts and surfaces, receiving input and events, since OpenGL does not provide such APIs itself. Simply grab the [source code](http://www.glfw.org/download.html) of GLFW, unzip and place the inner folder in /libraries, meanwhile renaming it to "glfw".

Next, I needed to grab another library called [Glad](http://glad.dav1d.de/). It is a web service that generates the OpenGL extension loading library according to our needs. Follow the screen below and generate the zip, unzip and place the contents in /libraries as well.

{% asset_img glad.PNG Glad config %}

Now, following the tutorial I wrote a C++ OpenGL [program](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/1.2.hello_window_clear/hello_window_clear.cpp) that opens a 800x600 window, and placed it in /source.

Finally, I wrote a Cmake script that builds the GLFW source tree along with my program.
```
# Project definition
cmake_minimum_required(VERSION 3.1)
project(Window)

# Source files
set(SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/source")
set(LIB_DIR "${CMAKE_CURRENT_SOURCE_DIR}/libraries")
set(SOURCES "${SRC_DIR}/hello_window_clear.cpp")

# Executable definition and properties
add_executable(${PROJECT_NAME} ${SOURCES})
target_include_directories(${PROJECT_NAME} PRIVATE "${SRC_DIR}")
set_property(TARGET ${PROJECT_NAME} PROPERTY CXX_STANDARD 11)

# GLFW
set(GLFW_DIR "${LIB_DIR}/glfw")
set(GLFW_BUILD_EXAMPLES OFF CACHE INTERNAL "Build the GLFW example programs")
set(GLFW_BUILD_TESTS OFF CACHE INTERNAL "Build the GLFW test programs")
set(GLFW_BUILD_DOCS OFF CACHE INTERNAL "Build the GLFW documentation")
set(GLFW_INSTALL OFF CACHE INTERNAL "Generate installation target")
add_subdirectory("${GLFW_DIR}")
target_link_libraries(${PROJECT_NAME} "glfw" "${GLFW_LIBRARIES}")
target_include_directories(${PROJECT_NAME} PRIVATE "${GLFW_DIR}/include")
target_compile_definitions(${PROJECT_NAME} PRIVATE "GLFW_INCLUDE_NONE")
```

Before compiling, we must check for the following dependencies:
- Cmake
- GCC
- make
- xorg-dev

I also needed an X server, since WSL does not have one natively. Fortunately, I already had VcXserv installed.
If you just installed one, open a bash window and run to set the environment variable $DISPLAY to be :0.0
```
export DISPLAY=:0.0
```
To have it take effect, restart bash or run
```
. ~/.bashrc
```

Afterwards, I ran
```
cd build
cmake ..
make
./Window
```
{% asset_img cmake.PNG Cmake success %}

{% asset_img make.PNG Make success %}

Both cmake and make succeeded! But the program gave an output of "Failed to create GLFW window".

But why is that? Is the X server not communicating properly with WSL? I tried to run glxgears, and it did show up...

{% asset_img gears.PNG Some gears %}

Eager to find out more, I added the debug statement in main().
```
static void error_callback(int error, const char* description)
{
    fprintf(stderr, "Error: %s\n", description);
}

glfwSetErrorCallback(error_callback);
```

In addition to the failure message, it also printed `Error: X11: RandR gamma ramp support seems broken`.

After finding no solution online, I used another X window server, Xming. Unfortunately, it prints another error: `Error: GLX: GLX version 1.3 is required`. First off, what is GLX? It is an extension (one that Glad finds) that provides an interface between the X Window system and OpenGL. And since we're technically developing in a Linux environment, Glad grabs GLX for us (If Windows, it grabs WGL. If macOS, it grabs CGL). And it seems like Xming's GLX support is capped at 1.2, so I had to find another X server, again.

My last resort seems to be Cygwin/X. Installing it was a bit of a pain, since X was not installed by default, so I had to go back and run the installer again. Interestingly, after starting Cygwin/X the X server was not detected at all. Thankfully, this [superuser post](https://superuser.com/questions/1180005/cygwin-x-and-windows-subsystem-for-linux) gave some insight. tldr: it does not listen by default, and you need to work around xauth.

Turns out Cygwin/X has four modes of rendering, each with a different flag to trigger. I tried each and here were the results:

| Type     |                       Software                        |          Hardware                                    |
|:--------:|:-----------------------------------------------------:|:----------------------------------------------------:|
| indirect (export LIBGL_ALWAYS_INDIRECT=1) |  Error: GLX: Failed to create context: GLXBadFBConfig | Error: Requested OpenGL version 3.3, got version 1.4 |
| direct   |    X Error of failed request:  GLXBadContext          |   X Error of failed request:  GLXBadContext          |

Using indirect hardware rendering seems the closest to success. But why is OpenGL version returning 1.4? A quick `glxinfo` brings up the following:

{% asset_img glxinfo.PNG glxinfo %}

It is recognizing the GPU, and it seems that the max it supports is 4.5. But (1.4) is always appended in front. After another round of research, it turns out that the GLX portion of various Windows X servers only support up to OpenGL 1.4. Setting MESA_GL_VERSION_OVERRIDE in Cygwin does not resolve, either, as it sets the output of GPU supported OpenGL but is always capped by that limit.

And the reason only indirect rendering works is because by using a Windows native X server like Xming, you are getting Linux applications to connect to the X server via a localhost TCP connection, and then redirecting all of their OpenGL calls to the X server, to be rendered in Windows Land.

## Moving On
So far, trying to develop OpenGL on WSL seemed like a futile attempt. However, for a beginner, failure is always a part of learning. Here are a few takeaways:
- Future setup for OpenGL development on Linux should be a breeze
- Learned what extensions are and what they do
- Learned the difference between direct and indirect rendering
- Learned how to link libraries with Cmake
- Saved massive amount of time by learning WSL's limitations ahead of CS488

I'm also thinking about how I should develop OpenGL in the future. Obviously, native is the way to go, but if I stick with Windows I have to deal with Visual Studio. On the other hand, I'm running out of drive space to actually dual boot Linux at this time of year...(Totally not because of games). With both Windows Redstone 4 and Ubuntu 18.04 LTS around the corner, it seems like a good opportunity to fresh install both and get ready for the next semester!

Oh, and if you who are reading this actually can run OpenGL programs in WSL, please let me know down below 👇

## References
https://learnopengl.com/
http://www.glfw.org/
http://x.cygwin.com/docs/ug/using-glx.html
