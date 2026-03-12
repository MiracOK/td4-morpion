<script>
export default {
    props: {
        errors: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<template>
    <div v-if="errors.length" class="error-alert">
        <ul>
            <li v-for="err in errors" :key="err">{{ err }}</li>
        </ul>
    </div>
</template>

<style scoped>
.error-alert {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
}

ul {
    margin: 0;
    padding-left: 20px;
}
</style>
