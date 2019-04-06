---
title: ARTP - Another Ray Tracing Project
date: 2019-04-02
tags:
categories:
- blog
---
<p>At long last, in my forth year at University of Waterloo I have taken the infamous CS 488, better known as Computer Graphics, which teaches us both real time rendering as well as ray tracing. It is almost a cumulation of my undergrad CS (un)learnings including C++, linear algebra, parametric equations and the like.</p><!-- more -->

For our final project we get to choose from either an OpenGL project or a ray tracer. I chose to make a ray tracer due to several reasons. As a first timer in ray tracing it is quite a departure from the forward pipeline and I was quite amazed by the various techniques used to generate photo-realistic images. Secondly, I have made a Dark Samus model from the hierarchal modelling assignment that looks quite off but is fully articulable, which I could use in the final rendering. Finally, one of my recent areas of exploration is computer animation, seeing that I will be working on EA's Frostbite animation team this summer, it would be nice to use this opportunity to create animation from scratch.

My final ray tracer not only can render specific scenes described by Lua scripts, but also supports commands to render animation. We each also got to pick 10 graphical objectives for grading. I have decided to implement the following objectives to create the final scene. 

## Ray Tracing Primitives
The ray tracer supports the following primitives: sphere, cube, cylinder and torus. The intersection calculation with each primitive can be defined by a formula [1] which I found to be useful. It also supports transformations of each primitive.

{% asset_img Primitives.png Primitives %}

## Reflection
In real life many objects have a surface that reflects rays at an angle same as the incident (θ_i = θ_r), which is known as the reflection law. The ray tracer simulates this by generating secondary reflection rays recursively whenever our ray hits a reflective material, and then sums up the colors [2].

{% asset_img Reflection.png Reflection %}

## Glossy Reflection
Not all surfaces have a smooth surface normal that is exactly the same as the primitives, however. The ray tracer simulates a glossy effect by perturbing the intersect normal. If the material has a glossy factor, the perturbed surface normal is obtained by rotating by polar angle α = arccos(1-x_1)^(1/2) and azimuthal angle β = 2πx_2 where x_1 and x_2 are random numbers between [0, 1].

{% asset_img Glossy_Reflection.png Glossy Reflection %}

## Refraction
Another property that some real-life objects have is refraction. When the ray goes from one medium to another, the ratio of the sines of the angles of incidence and refraction is equivalent to the reciprocal of the ratio of the indices of refraction. This is known as Snell's Law (n_i sin θ_i = n_t sin θ_t). In graphics land we assume air is vacuum with index of refraction 1. The technique is similar to reflection where we generate secondary refraction rays.

{% asset_img Refraction.png Refraction %}

## Glossy Refraction
Similar in principle to glossy reflection, glossiness can be created by random perturbations, but to the refracted ray [3], using the same formula.

{% asset_img Glossy_Refraction.png Glossy Refraction %}


## Soft Shadows
Shadows in ray tracing are determined when the ray from the intersection point to the light hits another object. Computer graphics usually simulate light by defining a point light source - however this is not realistic because lights are usually coming from an area and point lights cause harsh shadows. Area lighting is defined so what when testing for shadows, shadows are tested on randomly sampled points around a point. The shadow values are then averaged causing smoother shadows.

{% asset_img Soft_Shadows.png Soft Shadows %}

## Texture Mapping
By mapping a primitive's UV coordinates to its material's texture coordinates, it is able to set the diffuse color of the surface[4]. The acquired color from the texture if interpolated from a few neighbouring pixels. Each primitive has their own formula of finding their UVs. 

{% asset_img Texture.png Soft Texture Mapping %}

## Anti Aliasing
Anti Aliasing is done adaptively by first detecting pixels on edges across the image by color variation, and then applying super sampling on those pixels by subdividing the pixel into 4 strata and averaging colors from those 4 camera rays.

<div class="image-container">
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/AA.png" alt='Before AA' ><div><h5>Before AA</h5></div></div>
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/AA_1.png" alt='Edge detection' ><div><h5>Edge detection</h5></div></div>
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/AA_3.png" alt='After AA' ><div><h5>After AA</h5></div></div>
</div>

## Keyframe Animation
The ray tracer supports keyframe animation. The intermediate frames are interpolated along Bézier curves, and the curves are implemented according to W3C CSS timing function specification[5].

<div class="image-container">
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/Linear.gif" alt='Linear' ><div><h5>Linear</h5></div></div>
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/Ease.gif" alt='Ease' ><div><h5>Ease</h5></div></div>
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/Ease-in.gif" alt='Ease-in' ><div><h5>Ease-in</h5></div></div>
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/Ease-out.gif" alt='Ease-out' ><div><h5>Ease-out</h5></div></div>
<div><img src="/2019/04/02/ARTP-Another-Ray-Tracing-Project/Ease-in-out.gif" alt='Ease-in-out' ><div><h5>Ease-in-out</h5></div></div>
</div>

## The Final Scene
As a tribute to the video game “Metroid Prime 2” for the Nintendo GameCube, the final rendered animation is set in an enclosed, underground mechanical area with lighting and transparent tube structures. It describes an encounter between bounty hunter Samus Aran and her doppelganger Dark Samus.

{% asset_img Final_Scene.png Final Scene %}

<br>
<div class="video">
<iframe width="560" height="315" src="https://www.youtube.com/embed/SjcQWTjJyx8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## References

[1] https://www.cl.cam.ac.uk/teaching/1999/AGraphHCI/SMAG/node2.html

[2] http://inst.cs.berkeley.edu/~cs294-13/fa09/lectures/cookpaper.pdf

[3] http://artis.imag.fr/Members/David.Roger/whitted.pdf

[4] https://cumincad.architexturez.net/system/files/pdf/186e.content.pdf

[5] https://www.w3.org/TR/css-easing-1/ 
