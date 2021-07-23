const tasks = Vue.component('tasks', {
    props: ['user'],
    data(){
        return {
            userTasks: [],
            showTaskForm: false
        }
    },

    created() {
        bus.$on('complete-task', taskId => {
            let findTaskById = id => this.userTasks.find(task => task.id == id)
            let selectedTask = findTaskById(taskId) 
            
            if(selectedTask) selectedTask.completed = !selectedTask.completed
        });

        this.userTasks = this.getTasks(this.user.id)
    },

    computed: {
        style() {
            return {
                backgroundColor: 'rgb(233,244,251)',
                height: '100vh',
                width: '100vw'
            }
        }
    },

    methods: {
        createRandomTasks(nMaxTasks) {
            let tasks = []
            let availableStatus = {
                '0' : '',
                '1' : 'Importante',
                '2' : 'Urgente'
            }

            const getNumberInRange = (min, max) => {
                return  Math.random() * (max - min) + min
            }

            const getIntInRange = (min, max) => {
                return  Math.round(getNumberInRange(min, max))
            }


            for(let i= 0; i < nMaxTasks; i++) {
                let taskStatus = availableStatus[getIntInRange(0, 2)]
                let taskDescription = `teste-${i}`
                let newTask = this.taskFactory(taskDescription, taskStatus)
                
                newTask.id = i+1
                tasks.push(newTask)
            }

            return tasks
        },

        createTask(taskObjConfig) {
            let newTask = this.taskFactory(taskObjConfig.fields[1].value, "Urgente")
            this.userTasks = [...this.userTasks, newTask]
            this.showTaskForm = false
        },

        getTasks(id = 0) {
            if(id) {
                return [...this.createRandomTasks(3)]
            }
            else {
                throw Error("Você precisa estar logado para acessar esta área")
            }
        },

        orderTasks(sMethod, tasks) {
            const sortingMethods = {
                'priority' : sortByPriority
            }

            function sortByPriority(taskA, taskB) {
                if(taskA.status !== "Urgente" && taskB.status === "Urgente") {
                    return 1
                }
                else if(taskA.status === "Importante" && taskB.status === "Importante") {
                    return 0
                }
                else {
                    return -1
                }
            }

            return [...tasks].sort(sortingMethods[sMethod]);
        },

        taskFactory(description, status) {
            let _self = this
            return {
                completed: false,
                description,
                id: (_self.userTasks.length+1),
                status
            }
        },
    },

    components: {
        'group-list': groupList,
        'task-card': taskCard,
        'task-form': taskForm,
    },

    template:`
        <div class="centralize container direction-row">
            <group-list :list="orderTasks('priority', userTasks)" :groupKey="'status'"></group-list>
            <div class="centralize container direction-col" :style="style">
                <h1> Olá {{user.name}}, você tem {{userTasks.length}} tarefas pendentes. </h1>
                <div>placeholder filter</div>
                <task-card v-for="(task, index) in orderTasks('priority', userTasks)" :task="task" :key="index"></task-card>
            </div>
            <div class="fa-lg" 
                @click="showTaskForm = true" 
                style= "
                    background-color: rgb(22,208,141); 
                    width: 64px; 
                    height: 64px; 
                    border-radius: 64px; 
                    position: fixed; 
                    text-align: center; 
                    line-height: 64px; 
                    color:white">
                <i class="fas fa-plus"></i>
            </div>
            <task-form v-if="showTaskForm" :active="showTaskForm" @emit-task="createTask"></task-form>
        </div>`
})