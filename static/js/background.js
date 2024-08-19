// static/js/background.js

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodes = [];
    const numNodes = 100;
    let mouse = { x: undefined, y: undefined, radius: 150 };

    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            vx: Math.random() * 0.5 - 0.25,
            vy: Math.random() * 0.5 - 0.25
        });
    }

    function drawNode(node) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fill();
    }

    function drawEdge(node1, node2) {
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
        ctx.stroke();
    }

    function updateNodes() {
        nodes.forEach(node => {
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - node.x;
                let dy = mouse.y - node.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    node.vx -= dx * force * 0.02;
                    node.vy -= dy * force * 0.02;
                }
            }
            
            node.x += node.vx;
            node.y += node.vy;

            // Apply friction
            node.vx *= 0.95;
            node.vy *= 0.95;

            // Bounce off the edges
            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        updateNodes();

        nodes.forEach(node => {
            drawNode(node);
            nodes.forEach(otherNode => {
                if (node !== otherNode) {
                    const distance = Math.sqrt(Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2));
                    if (distance < 100) {
                        drawEdge(node, otherNode);
                    }
                }
            });
        });

        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', function(evt) {
        mouse.x = evt.clientX;
        mouse.y = evt.clientY;
    });

    document.addEventListener('mouseleave', function() {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    animate();
});