var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};System.register(['atril', 'utils/utils'], function(exports_1) {
    var atril_1, utils_1;
    var VM;
    return {
        setters:[
            function (_atril_1) {
                atril_1 = _atril_1;
            },
            function (_utils_1) {
                utils_1 = _utils_1;
            }],
        execute: function() {
            VM = (function () {
                function VM() {
                    var _this = this;
                    this.value = 'world';
                    this.color = 'blue';
                    this.fetched = '';
                    this.inputValue = '';
                    this.checked = false;
                    setTimeout(function () {
                        _this.value = utils_1.randomString();
                    }, 1000);
                    utils_1.ajax(utils_1.testUrl)
                        .then(function (value) {
                        _this.fetched = value;
                    });
                }
                VM.prototype.randomString = function () { return utils_1.randomString(); };
                VM.viewUrl = 'mock-component/mock-component.html';
                __decorate([
                    atril_1.assign
                ], VM.prototype, "element");
                VM = __decorate([
                    atril_1.Component({ tagName: 'mock-component' })
                ], VM);
                return VM;
            })();
        }
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vY2stY29tcG9uZW50L21vY2stY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbIlZNIiwiVk0uY29uc3RydWN0b3IiLCJWTS5yYW5kb21TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFHQTtnQkFVRUE7b0JBVkZDLGlCQXdCQ0E7b0JBcEJDQSxVQUFLQSxHQUFHQSxPQUFPQSxDQUFDQTtvQkFDaEJBLFVBQUtBLEdBQUdBLE1BQU1BLENBQUNBO29CQUNmQSxZQUFPQSxHQUFHQSxFQUFFQSxDQUFDQTtvQkFDYkEsZUFBVUEsR0FBR0EsRUFBRUEsQ0FBQ0E7b0JBQ2hCQSxZQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtvQkFHZEEsVUFBVUEsQ0FBQ0E7d0JBQ1RBLEtBQUlBLENBQUNBLEtBQUtBLEdBQUdBLG9CQUFZQSxFQUFFQSxDQUFDQTtvQkFDOUJBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO29CQUVUQSxZQUFJQSxDQUFDQSxlQUFPQSxDQUFDQTt5QkFDVkEsSUFBSUEsQ0FBQ0EsVUFBQUEsS0FBS0E7d0JBQ1RBLEtBQUlBLENBQUNBLE9BQU9BLEdBQUdBLEtBQUtBLENBQUNBO29CQUN2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1BBLENBQUNBO2dCQUVERCx5QkFBWUEsR0FBWkEsY0FBZ0JFLE1BQU1BLENBQUNBLG9CQUFZQSxFQUFFQSxDQUFBQSxDQUFBQSxDQUFDQTtnQkFFL0JGLFVBQU9BLEdBQUdBLG9DQUFvQ0EsQ0FBQ0E7Z0JBckJ0REE7b0JBQUNBLGNBQU1BO21CQUFDQSx1QkFBT0EsRUFBY0E7Z0JBRi9CQTtvQkFBQ0EsaUJBQVNBLENBQUNBLEVBQUNBLE9BQU9BLEVBQUVBLGdCQUFnQkEsRUFBQ0EsQ0FBQ0E7dUJBd0J0Q0E7Z0JBQURBLFNBQUNBO1lBQURBLENBeEJBLEFBd0JDQSxJQUFBIiwiZmlsZSI6Im1vY2stY29tcG9uZW50L21vY2stY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIGFzc2lnbn0gZnJvbSAnYXRyaWwnO1xuaW1wb3J0IHt0ZXN0VXJsLCBhamF4LCByYW5kb21TdHJpbmd9IGZyb20gJ3V0aWxzL3V0aWxzJztcblxuQENvbXBvbmVudCh7dGFnTmFtZTogJ21vY2stY29tcG9uZW50J30pXG5jbGFzcyBWTSB7XG4gIEBhc3NpZ24gZWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgdmFsdWUgPSAnd29ybGQnO1xuICBjb2xvciA9ICdibHVlJztcbiAgZmV0Y2hlZCA9ICcnO1xuICBpbnB1dFZhbHVlID0gJyc7XG4gIGNoZWNrZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMudmFsdWUgPSByYW5kb21TdHJpbmcoKTtcbiAgICB9LCAxMDAwKTtcblxuICAgIGFqYXgodGVzdFVybClcbiAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5mZXRjaGVkID0gdmFsdWU7XG4gICAgICB9KTtcbiAgfVxuXG4gIHJhbmRvbVN0cmluZygpIHtyZXR1cm4gcmFuZG9tU3RyaW5nKCl9XG5cbiAgc3RhdGljIHZpZXdVcmwgPSAnbW9jay1jb21wb25lbnQvbW9jay1jb21wb25lbnQuaHRtbCc7XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=