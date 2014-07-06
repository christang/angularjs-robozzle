'use strict';

angular.module('robozzleMain', ['robozzleObjects', 'robozzleWidgets'])
  .controller('MainCtrl', [
    '$scope', 'Stepper', 'WorldEditor', 'ProgramEditor', 'StyleMap', 'Heading', 'Material', 'Color', 'Op',
    function ($scope, Stepper, WorldEditor, ProgramEditor, StyleMap, Heading, Material, Color, Op) {
    
      $scope.range = _.range;

      function init() {
        $scope.view = {
          world: {
            offset: {
              x: 100,
              y: 2.5
            },
            tile: {
              height: 36,
              width: 36,
              horizPad: 1,
              verticalPad: 1
            }
          },
          program: {
            offset: {
              x: 175,
              y: 325
            },
            tile: {
              height: 24,
              width: 24,
              horizPad: 1,
              verticalPad: 1
            }
          }
        };
      }

      function initWorld() {
        var builder = new WorldEditor(9, 7)
          .ship(4, 3)
          .tile(5, 3)
          .tile(4, 2)
          .star(5, 2)
          .heading(Heading.UP);

        $scope.world = builder.build();
      }

      function initProgram() {
        var builder = new ProgramEditor(5)
          .op(0, 0, Op.FWD)
          .op(0, 1, Op.R90)
          .op(0, 2, Op.F1);

        $scope.program = builder.build();
      }

      function initWorldHelpers() {

        $scope.world.classAt = function (x, y) {

          var tile = $scope.world.at(x, y),
              classes = [];

          if (tile.isVoid) {
            classes = classes.concat(StyleMap.classes.board[Material.VOID]);
          } else {
            classes = classes.concat(StyleMap.classes.colors[tile.color]);
            if (tile.hasStar) {
              classes = classes.concat(StyleMap.classes.board[Material.STAR]);
            }
            if (tile.hasShip) {
              classes = classes.concat(StyleMap.classes.board[Material.SHIP]);
            }
          }
            
          return classes.join(' ');
        };

        $scope.world.iconAt = function (x, y) {

          var tile = $scope.world.at(x, y);

          if (tile.isVoid) {
            return StyleMap.icons.board[Material.VOID].join('');
          } else {
            if (tile.hasStar) {
              return StyleMap.icons.board[Material.STAR].join('');
            }
            if (tile.hasShip) {
              return StyleMap.icons.headings[tile.heading].join('');
            }
          }

        };

      }

      function initProgramHelpers() {
        $scope.program.isCurrent = function (r, c) {
          return (r + 1 === $scope.currentFn && c === $scope.currentPos);
        };

        $scope.program.classAt = function (r, c) {

          var tile = $scope.program.at(r, c),
              classes = [];

          if (tile.isNoOp()) {
            classes = classes.concat(StyleMap.classes.steps[Op.NOP]);
          } else {
            classes = classes.concat(StyleMap.classes.colors[tile.color]);
          }

          if ($scope.program.isCurrent(r, c)) {
            classes = classes.concat(StyleMap.classes.steps.cursor);
          }

          return classes.join(' ');
        };

        $scope.program.iconAt = function (r, c) {
          var step = $scope.program.at(r, c);
          return StyleMap.icons.ops[step.op][0];
        };

      }

      function initStepper() {

        function callback(fn, pos, status) {
          $scope.currentFn = fn;
          $scope.currentPos = pos;
          console.log(status, fn, pos);
        }

        $scope.stepper = new Stepper($scope.world,
                                     $scope.program);

        $scope.onSafeStep =
        $scope.onBadStep =
        $scope.onComplete = callback;

      }

      function initContextMenus() {

        function findElementWith(element) {
          var attrs = Array.prototype.slice.call(arguments, 1);
          while (element) {
            if (_.all(attrs, function (a) { return element.hasAttribute(a); })) {
              return element;
            }
            element = element.parentNode;
          }
          return null;
        }

        function toggleCxtMenu(scope, menu, offset) {
          return function (event) {
            var cell = findElementWith(event.target, 'pos-x', 'pos-y'),
                posX = cell.getAttribute('pos-x'),
                posY = cell.getAttribute('pos-y');
            if (!scope[menu]) {
              var box = event.target.getBBox(),
                  cx = box.x + box.width/2 + offset.x,
                  cy = box.y + box.height/2 + offset.y;
              scope[menu] = {'cx': cx, 'cy': cy};
            } else {
              scope[menu] = false;
            }
            // todo(clt)
            console.log(posX, posY);
          };
        }

        $scope.worldCxtMenu = false;
        $scope.toggleWorldCxtMenu = toggleCxtMenu($scope, 'worldCxtMenu',
                                                  $scope.view.world.offset);

        $scope.programCxtMenu = false;
        $scope.toggleProgramCxtMenu = toggleCxtMenu($scope, 'programCxtMenu',
                                                    $scope.view.program.offset);

      }

      init();
      initWorld();
      initWorldHelpers();
      initProgram();
      initProgramHelpers();
      initStepper();
      initContextMenus();

    }
  ]);
